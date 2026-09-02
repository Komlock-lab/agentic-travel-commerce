# Architecture

## 1. Design goal

チャネル、AIモデル、ウォレット、決済手段、旅行事業者を疎結合にし、Phase 0の動画から将来のPoCまで同じ責務分割を維持します。

Kovaは必須依存にせず、将来追加可能なPayment Adapterとして扱います。

## 2. Logical architecture

```text
┌──────────────────────────────────────────────┐
│ Channels                                     │
│ ChatGPT Plugin                               │
│ Conversation + MCP Apps UI                   │
└──────────────────────┬───────────────────────┘
                       │ User request / approval
┌──────────────────────▼───────────────────────┐
│ Travel Agent                                 │
│ Context / planning / explanation / recovery  │
└───────────────┬──────────────────┬───────────┘
                │                  │
       Search / booking       PaymentIntent
                │                  │
┌───────────────▼─────────┐  ┌────▼────────────────────────┐
│ Travel Tool Gateway     │  │ Payment Control Plane       │
│ Search / quote / book   │  │ Mandate / policy / approval │
│ cancel / availability   │  │ risk / idempotency / audit  │
└───────────────┬─────────┘  └────┬────────────────────────┘
                │                  │ AuthorizedPayment
┌───────────────▼─────────┐  ┌────▼────────────────────────┐
│ Merchant Adapters       │  │ Payment Adapters            │
│ Hotel / activity / food │  │ Stablecoin / x402 / card    │
└─────────────────────────┘  │ Kova in the future          │
                             └────┬────────────────────────┘
                                  │
                             Settlement rails
```

## 3. Component responsibilities

### Channel Adapter

- LINE、Webなどのイベントを共通メッセージ形式へ変換する
- ユーザー認証情報を内部User IDへ関連付ける
- 承認画面への署名付きリンクを提供する
- 決済や予約の長時間処理を非同期通知する

チャネル側に決済ロジックを持たせません。

### Travel Agent

- ユーザー要求を旅行条件へ変換する
- 不足情報を確認する
- Travel Toolを使って候補を検索する
- 旅程を構成し、選定理由と不確実性を説明する
- 予約、決済、失敗後の再計画をオーケストレーションする

Travel Agentは秘密鍵へアクセスせず、支払いの許可を最終判断しません。

### Travel Tool Gateway

旅行事業者ごとのAPI差分を吸収します。

```ts
interface TravelProvider {
  search(input: SearchRequest): Promise<Offer[]>;
  quote(offerId: string): Promise<Quote>;
  reserve(quoteId: string): Promise<Reservation>;
  confirm(reservationId: string, paymentRef: string): Promise<Booking>;
  cancel(bookingId: string): Promise<CancellationResult>;
}
```

Phase 0ではモック実装、Thin Sliceでは管理された加盟店実装、PoCでは協力企業のSandbox APIを想定します。

### Payment Control Plane

この企画の中核です。

- ユーザーから受けたMandateを保存する
- PaymentIntentを正規化する
- ポリシーを決定論的に評価する
- `ALLOW`、`REQUIRE_APPROVAL`、`DENY`を返す
- 承認結果と有効期限を検証する
- 二重支払いを防ぐ
- 監査イベントを記録する
- Payment Adapterを選択する

AIモデルの出力だけを根拠に決済を許可しません。

### Payment Adapter

決済手段ごとの差分を共通インターフェースに閉じ込めます。

```ts
type PaymentRail = "stablecoin" | "x402" | "card" | "kova";

interface PaymentAdapter {
  quote(intent: AuthorizedPayment): Promise<PaymentQuote>;
  pay(quote: PaymentQuote, idempotencyKey: string): Promise<PaymentResult>;
  status(paymentId: string): Promise<PaymentStatus>;
  refund(paymentId: string, amount?: Money): Promise<RefundResult>;
}
```

最初の実装候補はCard Sandbox Adapterです。StablecoinやKovaは同じ境界から後で追加できます。

### Audit Store

会話全文ではなく、判断に必要な構造化イベントを保存します。

- Mandateの作成、変更、失効
- 商品の見積もりと有効期限
- PaymentIntent
- ポリシー判定と理由
- 人間の承認または拒否
- 決済、返金の識別子
- 予約状態
- エラーとリカバリー

オンチェーントランザクションは監査情報の一部であり、監査情報のすべてをチェーンへ載せるわけではありません。

## 4. Core data contracts

### PaymentIntent

```ts
type PaymentIntent = {
  intentId: string;
  mandateId: string;
  userId: string;
  purpose: string;
  merchantId: string;
  merchantWallet?: string;
  amount: Money;
  category: "lodging" | "activity" | "food" | "transport" | "other";
  cancellable: boolean;
  refundPolicy: string;
  quoteId: string;
  quoteExpiresAt: string;
  bookingReference: string;
};
```

### PolicyDecision

```ts
type PolicyDecision = {
  decision: "ALLOW" | "REQUIRE_APPROVAL" | "DENY";
  reasonCodes: string[];
  evaluatedPolicyVersion: string;
  remainingBudget: Money;
  expiresAt: string;
};
```

## 5. Security boundaries

### Model output is untrusted

AIが作成したPaymentIntentは入力候補として扱い、サーバー側で金額、通貨、加盟店、見積もり、予約情報を再検証します。

### Keys are isolated

署名鍵はモデルのプロンプト、会話履歴、Travel Toolから分離します。エージェントは署名要求を出せますが、秘密鍵を読み取れません。

### Policy is deterministic

上限、カテゴリ、期限、宛先、承認条件の評価は通常のコードまたは検証可能なルールで行います。

### Quote binding

承認は、金額、通貨、加盟店、商品、見積期限に結び付けます。承認後に価格や宛先が変わった場合は再承認します。

### Idempotency

予約と決済に安定したIdempotency Keyを割り当て、Webhook再送やリトライで二重決済しないようにします。

### Minimize personal data on-chain

氏名、旅程、宿泊先、連絡先をオンチェーンへ記録しません。チェーン上には支払いに必要な情報のみを送ります。

## 6. Payment sequencing

予約と決済を単純に同時実行すると、支払い済みだが在庫がない状態が発生します。加盟店APIに応じて次のいずれかを選びます。

1. 在庫を一時確保する
2. 最新見積もりを取得する
3. ポリシー評価と必要な承認を行う
4. 支払う
5. 予約を確定する
6. 確定失敗時は即時取消または返金へ進む

Thin Sliceでは、この状態遷移を一つの加盟店について実証します。

## 7. Open architecture decisions

- Stablecoin Adapterで使用するチェーンとトークン
- ユーザーウォレット、Smart Account、カストディの選択
- 決済ポリシーをオフチェーンのみで強制するか、一部をオンチェーン化するか
- ステーブルコイン非対応加盟店へのカードフォールバック方式
- 予約確定前の資金拘束方式
- 法人利用時の承認者、部署予算、経費規定との接続

これらはPhase 0では固定せず、協力企業とPoCを設計する際に決定します。
