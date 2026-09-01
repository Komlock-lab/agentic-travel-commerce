# Payment Policy

## 1. Purpose

決済ポリシーは、ユーザーの意図とAIの実行権限の境界を明確にします。

AIモデルへ「常識的に判断すること」を求めるだけでは、支払い権限の制御になりません。取引ごとに、構造化されたMandateとPaymentIntentを決定論的に比較します。

## 2. Mandate example

```json
{
  "mandateId": "kyoto-trip-2026-10",
  "purpose": "2名の京都旅行の予約",
  "validFrom": "2026-09-01T00:00:00+09:00",
  "validUntil": "2026-10-12T00:00:00+09:00",
  "totalBudget": {
    "amount": 120000,
    "currency": "JPY"
  },
  "categoryLimits": {
    "lodging": 70000,
    "activity": 20000,
    "food": 40000
  },
  "autoPayLimit": 20000,
  "allowedDestination": "Kyoto",
  "priceIncreaseTolerancePercent": 5,
  "requireApprovalWhen": [
    "amount_exceeds_auto_pay_limit",
    "non_cancellable",
    "card_fallback",
    "merchant_not_previously_used"
  ]
}
```

これはコンセプト例であり、最終的なAPI仕様ではありません。

## 3. Decision model

### ALLOW

以下をすべて満たす場合、自動決済できます。

- Mandateが有効
- 旅行目的と商品が一致
- 加盟店と支払先が検証済み
- 1件上限、カテゴリ上限、総予算以内
- 見積もりが有効
- キャンセル条件が許可範囲内
- 優先または許可されたPayment Railを使用
- 同じPaymentIntentが未決済

### REQUIRE_APPROVAL

禁止ではないが、ユーザーまたは承認者の判断が必要な状態です。

- 自動決済上限を超える
- キャンセル不可
- 提案時から価格が許容幅を超えて上昇
- ステーブルコインからカードへフォールバック
- 新規加盟店
- 旅程全体へ大きな影響を与える変更

承認画面には「承認」ボタンだけでなく、確認が必要になった理由と差分を表示します。

### DENY

次の場合は、追加確認ではなく拒否します。

- Mandateの有効期限切れ
- 総予算、カテゴリ上限を超過
- 旅行目的と無関係
- 支払先の検証に失敗
- 通貨、チェーン、トークンが許可されていない
- 見積もりまたは予約Referenceとの結び付けがない
- 改変された承認情報
- 重複決済

ユーザーが条件を変更したい場合は、新しいMandateまたは明示的な変更承認を作成します。

## 4. Evaluation order

```text
1. Authenticate user and agent
2. Load active Mandate and immutable version
3. Verify merchant, quote and booking reference
4. Normalize currency and amount
5. Check purpose, destination and category
6. Check total, category and per-transaction limits
7. Check cancellation and refund conditions
8. Select available Payment Rail
9. Determine ALLOW / REQUIRE_APPROVAL / DENY
10. Record decision before execution
```

## 5. Human approval

承認は会話上の「OK」という文字列だけで扱いません。

承認対象には最低限、以下を結び付けます。

- PaymentIntent ID
- 加盟店IDと支払先
- 金額と通貨
- 商品または予約Reference
- キャンセル条件
- 見積もりの有効期限
- 使用するPayment Rail
- 承認の有効期限

金額、宛先、商品、Payment Railが変わった場合は、古い承認を再利用しません。

## 6. Stablecoin-first routing

Payment Railの選択順は次のように想定します。

1. 加盟店が指定ステーブルコインを直接受け取れる
2. 加盟店がx402等のAgent向け決済に対応している
3. 認定された決済仲介を利用できる
4. カード等の既存決済へフォールバックする

カードへのフォールバックはユーザー体験を壊さない一方で、手数料、返金、チャージバック、加盟店名義などの条件が変わります。そのためPhase 0では自動切り替えず、明示的な確認対象にします。

## 7. Refund and cancellation

支払い完了は旅行手配の完了ではありません。次の状態を分けて管理します。

```text
DRAFT
  → QUOTED
  → POLICY_ALLOWED
  → APPROVAL_REQUIRED
  → AUTHORIZED
  → PAYMENT_PENDING
  → PAID
  → BOOKED
  → CANCEL_PENDING
  → REFUND_PENDING
  → REFUNDED
```

代表的な例外：

- 支払ったが予約確定に失敗した
- 一部の予約だけ確定した
- 返金額が当初の支払額より少ない
- オンチェーンでは支払済みだが、加盟店が未確認
- カード決済だけ取消可能期間が異なる

エージェントはこれらを「失敗しました」で終わらせず、残りの旅程、残予算、回収見込みを説明します。

## 8. Audit event example

```json
{
  "event": "policy.decision.created",
  "intentId": "pay_activity_001",
  "mandateId": "kyoto-trip-2026-10",
  "policyVersion": "1",
  "decision": "ALLOW",
  "reasonCodes": ["WITHIN_AUTO_PAY_LIMIT", "MERCHANT_VERIFIED"],
  "amount": 9400,
  "currency": "JPY",
  "createdAt": "2026-09-01T13:00:00Z"
}
```

## 9. Production considerations

PoCから本番へ進む際は、以下を専門家およびパートナーと確認します。

- 資金、鍵、ウォレットの管理主体
- 本人確認、取引モニタリング、制裁対応
- 資金決済、暗号資産、前払式支払手段等への該当性
- 旅行業、キャンセル、消費者保護への対応
- 会計、税務、為替差、手数料の扱い
- カード情報を扱う場合のセキュリティ要件
- 事故時の責任分界と補償

本資料は法的見解ではなく、PoC設計上の論点整理です。
