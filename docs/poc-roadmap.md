# PoC Roadmap

## Overview

大きなプロダクト開発を先に行わず、商談で必要な証拠を段階的に増やします。

```text
Phase 0            Phase 1             Phase 2              Phase 3
Concept video  →  Thin Slice      →  Partner PoC       →  Production design
伝わるか           本当に払えるか      業務で価値があるか     運用できるか
```

## Phase 0: Concept validation

### Objective

イベントと初回商談で、相手が自社のユースケースを具体的に話せる状態を作ります。

### Deliverables

- 90秒コンセプト動画
- 5分の解説版またはライブ説明用資料
- 主要画面のモックアップ
- アーキテクチャと決済ポリシー
- PoCスコープ選定用の質問票

### What is real

- 実装可能な責務分割
- 決済ポリシーと状態遷移
- 具体的なUX、例外処理

### What may be simulated

- 旅行在庫
- 予約API
- ステーブルコイン送金
- カードフォールバック

シミュレーション箇所は動画内または説明資料で明示します。

### Exit criteria

- 3社以上から具体的な自社ワークフローへの適用質問が出る
- PoC候補企業が、利用可能なAPIまたは業務データを提示する
- 最初に実証すべき決済手段と加盟店が決まる

件数はイベント規模に合わせて調整します。

## Phase 1: Thin Slice

### Objective

AIの依頼からポリシー判定、実際のステーブルコイン決済、予約確定までを一つの経路で動かします。

### Recommended scope

- Webチャットまたは単一のチャネル
- 一種類の商品
- 一つの管理された加盟店
- 一チェーン、一ステーブルコイン
- ALLOW、REQUIRE_APPROVAL、DENYの3ケース
- テストネットまたは管理された少額取引
- 返金または取消の1ケース
- 監査ログ

### Out of scope

- 複数の実在旅行事業者
- カードフォールバックの本番接続
- 本番の旅行在庫
- カストディサービス
- 一般ユーザー公開

### Exit criteria

- 二重決済なしで一連の状態遷移を完了できる
- モデルが不正なPaymentIntentを作ってもポリシーが拒否できる
- 取引と予約Referenceを監査画面から追跡できる
- 失敗時に返金または安全な停止ができる

## Phase 2: Partner PoC

### Objective

協力企業の実際の業務、API、決済手段を使い、導入価値と運用課題を検証します。

### Possible partner patterns

#### Travel provider

予約APIをAgent Toolとして公開し、Agent経由のコンバージョンと運用負荷を検証します。

#### Payment or stablecoin provider

ウォレット、オン／オフランプ、加盟店精算、取引監視を検証します。

#### Corporate travel or expense provider

出張規定、部署予算、承認フローをMandateへ変換します。

#### API or data provider

旅行ではなく、有料APIをAgentが発見し、利用時に少額決済するユースケースを検証します。

### Measurements

- 手配完了までの人間操作数
- 承認が必要になった比率と理由
- 予算、規定違反の検知数
- 予約、決済、返金の成功率
- 例外からの復旧時間
- 従来フローとの手数料、開発、運用差
- ユーザーがAIへ委譲してよいと感じる範囲

## Phase 3: Production design

### Objective

本番運用に必要な責任分界、セキュリティ、法務、会計、サポートを確定します。

### Workstreams

- 鍵管理、カストディ、Smart Account
- 本人確認、取引監視、制裁対応
- 旅行業、決済、消費者保護
- 障害対応、返金、紛争処理
- モデル評価、プロンプトインジェクション対策
- 監査ログ、データ保持、プライバシー
- SLA、サポート、加盟店オンボーディング

## Build/no-build gates

### Gate A: After video

動画を見ても「ステーブルコインで払っただけ」という反応が多い場合は、実装せずコンセプトを修正します。

### Gate B: Before Thin Slice

実送金を行う理由、対象加盟店、検証したいポリシーが決まらない場合は、画面実装を増やしません。

### Gate C: Before Partner PoC

協力企業がAPI、Sandbox、業務フローのいずれも提供できない場合は、共同PoCではなく技術デモとして維持します。

### Gate D: Before production

決済、鍵、事故時責任の主体が決まらない限り、一般ユーザー向けに公開しません。
