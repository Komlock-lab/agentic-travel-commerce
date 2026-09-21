import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { previewHtml } from "../src/preview.js";
import { widgetHtml } from "../src/widget.js";

test("inline widget is ChatGPT-native and contains valid JavaScript", () => {
  assert.match(widgetHtml, /好きな組み合わせを選んでください/);
  assert.doesNotMatch(widgetHtml, /KOMLOCK LAB/);
  assert.doesNotMatch(widgetHtml, /linear-gradient/);
  assert.match(widgetHtml, /CARD SANDBOX/);

  const script = widgetHtml.match(/<script>([\s\S]+)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(() => new vm.Script(script));
});

test("preview renders a ChatGPT conversation shell and all demo modes", () => {
  assert.match(previewHtml, /ChatGPT UI preview/);
  assert.match(previewHtml, /data-scenario="happy"/);
  assert.match(previewHtml, /data-scenario="price_change"/);
  assert.match(previewHtml, /data-scenario="denied"/);

  const script = previewHtml.match(/<script type="module">([\s\S]+)<\/script>/)?.[1];
  assert.ok(script);
  const checked = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: script, encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
});
