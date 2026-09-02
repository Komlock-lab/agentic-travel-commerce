import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { widgetHtml } from "../src/widget.js";

test("standalone widget contains all demo entry points and valid JavaScript", () => {
  assert.match(widgetHtml, /data-start="happy"/);
  assert.match(widgetHtml, /data-start="price_change"/);
  assert.match(widgetHtml, /data-start="denied"/);
  assert.match(widgetHtml, /SIMULATED INVENTORY/);
  assert.match(widgetHtml, /CARD SANDBOX/);

  const script = widgetHtml.match(/<script>([\s\S]+)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(() => new vm.Script(script));
});
