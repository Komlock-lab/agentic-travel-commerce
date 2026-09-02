# ChatGPT Interactive UX

## Product decision

デモは「ChatGPT風の独自チャット」ではなく、ChatGPT Pluginとして実装します。会話を主導線にし、比較や確認に構造が必要な場面だけ、MCP serverが会話内UIを返します。

決済レールはUXの主役にしません。最初はカードSandboxを使い、ステーブルコインは同じPayment Control Planeから選べる追加Adapterとして残します。

Komlock Labの価値は、特定のチェーンやウォレットではなく、AIへ用途・金額・期限を限定した実行権限を渡し、価格変更や不正な支払いを決定論的に止められることです。

## Demo promise

ユーザーは次の一連の体験を実際に操作できます。

1. 自然文で旅行を依頼する
2. AIが不足している条件だけを質問する
3. 旅行プランと総額を比較する
4. 自動決済の範囲を確認する
5. 高額または取消不可の商品だけを承認する
6. カードSandboxで支払い、予約状態を確認する
7. 価格変更時に処理が止まり、差分を見て再承認する
8. 支払い、承認、拒否、残予算の監査サマリーを見る

## Golden path

### 1. Request

ユーザー：

> 10月12日から14日、2名で京都。12万円以内。駅に近い宿と夕食、体験を1つ入れて。

ChatGPTは入力内容を長く復唱せず、意思決定に必要な質問を1つだけ返します。

> 2万円以下で、キャンセル可能な商品は自動で確定してよいですか？

### 2. Delegation card

会話内UIに以下を表示します。

| 条件 | 値 |
| --- | --- |
| 総予算 | 120,000円 |
| 1件の自動決済上限 | 20,000円 |
| 必ず確認 | 取消不可、20,000円超、5%以上の価格上昇 |
| 有効期限 | この旅行の予約完了まで |
| 決済 | 登録済みカードのSandbox token |

ボタンは `この条件で探す` と `条件を変更` の2つに絞ります。

### 3. Itinerary comparison

商品一覧ではなく、移動と空き時間まで成立する旅程を2案表示します。各案に次を含めます。

- 合計金額と残予算
- 宿、体験、夕食の内訳
- 変更・取消条件
- 選定理由
- 見積取得時刻と有効期限
- 自動確定される商品と、承認が必要な商品

ユーザーは `A案で進める` を選びます。

### 4. Approval and execution

陶芸体験9,400円はポリシー内のため、自動確定します。ホテル64,000円と取消不可の夕食は、差分をまとめたApproval cardで確認します。

承認画面には「合計金額」だけでなく、確認が必要になった理由を表示します。

- ホテル：自動決済上限を44,000円超過
- 夕食：取消不可
- 承認の有効期限：見積有効期限まで

### 5. Exception

ホテル価格を64,000円から69,000円へ変更するテストケースを用意します。承認済みの金額から5%以上変わったため、決済は自動で止まります。

UIは次の3点だけを強調します。

- 何が変わったか
- 旅行全体への影響
- 再承認または代替案の選択

### 6. Receipt and audit

最後に、旅程、予約番号、支払い方法、支払済み額、残予算、承認者、拒否または再承認の理由を一画面にまとめます。

## Tool surface

ChatGPTに公開するMCP toolsは、会話の都合ではなくユーザーの達成目標単位で設計します。

```text
create_trip_mandate
search_trip_options
propose_itinerary
hold_booking
request_payment
confirm_booking
cancel_booking
refund_payment
get_trip_audit
```

検索や判定のtoolは構造化データを返し、比較、承認、監査だけをUI toolで描画します。UI内の操作から決済toolを直接呼ぶ場合も、サーバー側で見積、ポリシー、承認、有効期限を再検証します。

## Reality boundary

### Real in the first interactive demo

- ChatGPTからのMCP tool呼び出し
- 会話内の旅程、Mandate、Approval、Audit UI
- 決定論的な `ALLOW / REQUIRE_APPROVAL / DENY`
- 予約と決済の状態遷移
- Idempotencyと監査イベント
- カードSandbox決済

### Simulated

- 旅行在庫と価格変動
- 実在する宿、飲食店、体験の予約
- 本番請求、実売上、実返金

画面には `Sandbox payment` と `Simulated inventory` を常時明示します。

## Payment rail strategy

カードを使っても、Komlock Labの意味は失われません。制御対象を「ウォレット」ではなく、カードtokenやステーブルコインwalletを含む支払い権限として定義します。

```text
ChatGPT
  -> Travel tools
  -> Payment Control Plane
       -> Card Sandbox Adapter (demo default)
       -> Stablecoin Adapter (optional)
       -> Kova Adapter (future)
```

ステーブルコイン版を追加する場合もUXは変えず、決済結果のrailとsettlement referenceだけを差し替えます。

## Three demo runs

1. `Happy path`: 予算内でカードSandbox決済まで完了
2. `Reapproval`: 価格が5%以上上がり、自動停止して再承認
3. `Denied`: 未許可の加盟店または上限超過を資金移動前に拒否

この3本を同じUIで切り替えられるようにし、商談相手が正常系だけでなく運用時の安心まで評価できる状態を完成条件とします。
