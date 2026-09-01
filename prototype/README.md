# Motion Prototype

90秒コンセプト動画のための、依存関係のないHTML/CSS/JavaScriptプロトタイプです。

## Preview

リポジトリのルートでローカルサーバーを起動します。

```bash
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173/prototype/` を開きます。

- Space: 再生、一時停止
- ← / →: 1秒移動
- 画面下部へマウスを動かす: Player controlsを表示
- `?t=44`: 指定秒から表示
- `?render=1`: 書き出し用にPlayer controlsを非表示

## Reality label

すべての画面は `CONCEPT UI` です。決済画面のトランザクションは `CONCEPT TRANSACTION` と明示しています。実際のテスト取引を接続した場合のみ、該当シーンを `LIVE TEST TRANSACTION` へ変更します。

## Export

Playwright、Google Chrome、FFmpegが利用できる環境で以下を実行します。

```bash
node scripts/render-video.mjs
bash scripts/render-narration.sh
```

`render-video.mjs` は90秒分のフレームを描画するため、完了まで数分かかります。ナレーション原稿は [voiceover.txt](./voiceover.txt) で管理します。
