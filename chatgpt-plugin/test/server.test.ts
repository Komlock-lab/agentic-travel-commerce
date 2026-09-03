import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createHttpApp } from "../src/server.js";

test("serves the preview and completes an MCP tool sequence", async (t) => {
  const listener = createHttpApp().listen(0, "127.0.0.1");
  await once(listener, "listening");
  t.after(() => listener.close());

  const address = listener.address();
  assert.ok(address && typeof address !== "string");
  const origin = `http://127.0.0.1:${address.port}`;

  const preview = await fetch(origin);
  assert.equal(preview.status, 200);
  assert.match(await preview.text(), /KOMLOCK LAB/);

  const client = new Client({ name: "integration-test", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));
  await client.connect(transport);
  t.after(() => client.close());

  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map((tool) => tool.name),
    [
      "create_trip_mandate",
      "search_trip_options",
      "choose_trip_option",
      "confirm_and_pay",
      "resolve_trip_exception",
      "get_trip_audit",
    ],
  );
  assert.equal(tools.tools[0]?._meta?.["openai/widgetAccessible"], true);

  const resource = await client.readResource({ uri: "ui://agentic-travel/trip-v1.html" });
  assert.equal(resource.contents[0]?.mimeType, "text/html;profile=mcp-app");
  assert.match("text" in resource.contents[0]! ? resource.contents[0].text : "", /KOMLOCK LAB/);

  const created = await client.callTool({
    name: "create_trip_mandate",
    arguments: {
      destination: "京都",
      startDate: "2026-10-12",
      endDate: "2026-10-14",
      travelers: 2,
      budget: 120_000,
      autoPayLimit: 20_000,
      scenario: "happy",
    },
  });
  const createdData = created.structuredContent as { tripId: string; view: string };
  assert.equal(createdData.view, "mandate");

  const searched = await client.callTool({
    name: "search_trip_options",
    arguments: { tripId: createdData.tripId },
  });
  assert.equal((searched.structuredContent as { view: string }).view, "options");

  const selected = await client.callTool({
    name: "choose_trip_option",
    arguments: { tripId: createdData.tripId, optionId: "plan_a" },
  });
  assert.equal((selected.structuredContent as { view: string }).view, "approval");

  const paid = await client.callTool({
    name: "confirm_and_pay",
    arguments: { tripId: createdData.tripId },
  });
  const paidData = paid.structuredContent as { view: string; status: string; paymentId: string };
  assert.equal(paidData.view, "audit");
  assert.equal(paidData.status, "completed");
  assert.match(paidData.paymentId, /^pay_demo_/);
});
