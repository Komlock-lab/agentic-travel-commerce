# 90-second Video Storyboard

## Production brief

| 項目 | 方針 |
| --- | --- |
| 長さ | 85–95秒 |
| 比率 | 16:9、イベント投影を優先 |
| 言語 | 日本語、英語字幕を追加可能な構成 |
| トーン | 落ち着いたプロダクトデモ。過度な近未来演出は避ける |
| 主画面 | モバイルチャット＋デスクトップの旅程・監査画面 |
| 決済表示 | ユーザーには簡潔に、技術情報は必要時だけ展開 |
| Reality label | Concept UI / Prototype / Live test transaction |

## Visual system

- 通常状態：白または薄いグレー
- AIの提案：青
- 自動実行可能：緑
- 人間の確認：黄
- 拒否、停止：赤
- ステーブルコイン：通貨ロゴへ依存せず、決済手段名をテキスト表示
- ブロックチェーン演出：回転するコインではなく、署名、Policy check、Transaction statusを表示

## Scene list

### S01 — The problem

**Time:** 0:00–0:06

**Visual:** 宿、体験、レストランの予約タブと支払い画面が重なる。操作回数が増えていく。

**On-screen copy:**

> 旅行は、決めた後が長い。

**Voice-over:**

> 検索、比較、予約、支払い。旅行手配は、いくつものサービスに分断されています。

**Reality label:** なし

### S02 — Create a mandate

**Time:** 0:06–0:17

**Visual:** 「旅行用の決済権限」カードへ条件を設定する。

**UI copy:**

```text
京都旅行・2名
総予算              ¥120,000
自動決済上限         ¥20,000 / 件
キャンセル不可       常に確認
価格上昇             5%を超えたら停止
期限                 予約完了まで
```

**Voice-over:**

> 最初に、目的、予算、確認条件を設定します。AIへ渡すのは、無制限な財布ではありません。

**Reality label:** Concept UI

### S03 — Ask in chat

**Time:** 0:17–0:27

**Visual:** LINE風のチャット。特定プラットフォームのブランド素材を使用する場合は利用条件を確認する。

**User message:**

> 京都旅行を2人、12万円以内で手配して。駅近の宿と、夕食、体験を1つ。

**Agent response:**

> 条件に合う組み合わせを、キャンセル条件と移動時間も含めて確認します。

**Voice-over:**

> あとは、普段の言葉で依頼します。

**Reality label:** Concept UI

### S04 — Build a bookable itinerary

**Time:** 0:27–0:44

**Visual:** チャットからデスクトップ旅程画面へ展開。地図、時刻、商品カードを表示する。

**UI copy:**

```text
提案 A                           ¥108,400 / ¥120,000

ホテル                           ¥64,000  要確認
駅徒歩4分・変更可能

陶芸体験                          ¥9,400  自動決済可能
旅程の空き時間に一致

夕食                             ¥35,000  要確認
キャンセル不可

価格確認 22:51 JST              残予算 ¥11,600
```

**Voice-over:**

> AIは商品を並べるだけでなく、予算、移動、キャンセル条件を含む実行可能な旅程を作ります。

**Reality label:** Concept UI

### S05 — Autonomous stablecoin payment

**Time:** 0:44–0:57

**Visual:** 陶芸体験カードの横にPolicy checkが表示され、支払い、予約確定へ進む。

**UI copy:**

```text
Purpose match       ✓
Merchant verified   ✓
Within limit        ✓

9,400円相当をステーブルコインで支払い
Transaction  0x12...89ab
Booking      Confirmed
```

**Voice-over:**

> 条件内の取引は、エージェントがステーブルコインで決済し、予約まで完了します。

**Reality label:** Concept UI。実送金版を作った後だけLive test transactionへ変更する。

### S06 — Meaningful approval

**Time:** 0:57–1:09

**Visual:** モバイルへ戻る。確認理由が差分として表示される。

**UI copy:**

> ホテルは自動決済上限を44,000円超えています。  
> 夕食はキャンセル不可です。

Buttons:

- ホテルだけ承認
- 両方承認
- 代替案を見る

**Voice-over:**

> 高額、または取消できない取引だけ、人間に判断を戻します。

**Reality label:** Concept UI

### S07 — Stop safely

**Time:** 1:09–1:20

**Visual:** 価格が64,000円から69,000円へ変化。決済が赤色の停止状態になる。代替ホテルが現れる。

**UI copy:**

```text
Payment stopped
価格が7.8%上昇し、許容幅5%を超えました。

代替案  ¥65,500 / 同エリア / 変更可能
```

**Voice-over:**

> 条件が変われば、勝手に進めず停止し、旅程全体を再調整します。

**Reality label:** Concept UI

### S08 — Audit and close

**Time:** 1:20–1:30

**Visual:** 監査タイムラインを表示した後、ブランドメッセージへ切り替える。

**Audit timeline:**

```text
22:51  Mandate verified
22:52  Activity payment allowed
22:52  Stablecoin payment confirmed
22:53  Hotel approval requested
22:54  Price change detected — payment stopped
```

**Final copy:**

> AIに旅行を提案させるだけではない。  
> AIに安全な決済権限を渡し、商取引を完了させる。

> Agentic Travel Commerce  
> by Komlock Lab

**Voice-over:**

> AIの判断を、安全で検証可能な経済活動へ。Agentic Travel Commerce by Komlock Lab。

**Reality label:** Concept

## Asset checklist

- モバイルチャット画面
- Mandate設定画面
- 旅行プラン画面
- Policy checkアニメーション
- 決済、予約の状態表示
- 承認Bottom Sheet
- 価格変更と停止状態
- 監査タイムライン
- ロゴ、CTA
- 日本語ナレーション
- 日本語、英語字幕ファイル
- BGM、効果音の利用許諾

## Capture plan

Phase 0では、Figma等で作成した画面を動画編集ソフト上で接続して構いません。ただし、カーソル操作だけで機能が動いているように見せるより、場面ごとにReality labelを表示します。

Thin Slice完成後はS05のみ実際の画面収録へ差し替え、Concept動画を段階的にLive demoへ更新します。

## Review questions

動画制作へ進む前に、以下をレビューします。

- 旅行UXが主役に見えるか
- ステーブルコインを使う理由が伝わるか
- 自動決済と人間確認の境界が理解できるか
- 「AIが勝手に払う」という不安を増やしていないか
- 価格変動、在庫切れ、返金の現実性があるか
- Komlock Labの役割が旅行アプリ開発ではなく、決済実行レイヤーだと伝わるか
- 視聴後に、自社のPoCを相談したくなるか
