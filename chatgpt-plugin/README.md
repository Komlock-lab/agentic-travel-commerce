# ChatGPT Interactive Mock

旅行の依頼、支払い条件、旅程比較、承認、カードSandbox決済、例外処理、監査履歴を、ChatGPT PluginのMCP toolsと会話内HTML UIで体験するモックです。

## What works

- Streamable HTTP MCP endpoint: `/mcp`
- ChatGPT/MCP Apps互換の会話内HTML UI
- UIボタンから次のMCP toolを呼ぶ操作フロー
- インメモリの旅行状態と監査イベント
- `ALLOW / REQUIRE_APPROVAL / DENY` のポリシー判定
- 正常系、価格変更、拒否の3シナリオ
- ChatGPTなしで触れるStandalone preview

旅行在庫とカード決済はモックです。実在商品の予約、実課金、実返金は行いません。

## Run locally

Node.js 20以上が必要です。

```bash
npm install
npm run build
npm start
```

ブラウザで `http://localhost:3000/` を開くと、3シナリオを単体で試せます。

MCP endpointは `http://localhost:3000/mcp` です。MCP InspectorではTransportに `Streamable HTTP` を選び、このURLを入力します。

```bash
npx @modelcontextprotocol/inspector@latest
```

## Connect from ChatGPT

ChatGPTからローカルMCP serverへ接続するには、公開HTTPS endpointまたはSecure MCP Tunnelが必要です。

1. サーバーを起動する
2. ChatGPTのSettings → Security and loginでDeveloper modeを有効にする
3. ChatGPT Pluginsで `+` を選ぶ
4. Secure MCP Tunnel、または公開HTTPSの `/mcp` URLを設定する
5. 検出された6 toolsとUI metadataを確認する
6. 新しい会話で作成したconnectionを有効にする

Developer modeの利用可否はアカウントとworkspace policyに依存します。

## Starter prompts

正常系：

> 10月12日から14日、2名で京都。12万円以内。駅に近い宿と夕食、体験を1つ入れて。2万円以下で変更可能な商品は自動決済してよいです。正常系のデモで進めて。

価格変更：

> 同じ条件で京都旅行を手配して。今回は価格変更が起きるデモを見せて。

拒否：

> 同じ条件で京都旅行を手配して。決済ポリシーが不正な支払いを拒否するケースを見せて。

## MCP tools

| Tool | Role |
| --- | --- |
| `create_trip_mandate` | 旅行条件と支払い委任を作成 |
| `search_trip_options` | 2つのモック旅程を生成 |
| `choose_trip_option` | 選択した旅程をポリシー評価 |
| `confirm_and_pay` | Sandbox決済、停止、拒否を実行 |
| `resolve_trip_exception` | 価格変更を再承認または代替案で解決 |
| `get_trip_audit` | 監査履歴を表示 |

## Verify

```bash
npm run check
npm test
npm run build
```

テストはドメインロジックの3シナリオに加え、実際のStreamable HTTP transportで初期化、tool一覧、tool呼び出し、UI metadataを検証します。

## Current limitations

- 状態はプロセス再起動で消えます
- 認証は未実装です
- 旅行在庫は固定fixtureです
- 支払いはカードSandboxの状態遷移のみで、決済代行サービスには未接続です
- 外部公開用のホスティング設定は含みません
