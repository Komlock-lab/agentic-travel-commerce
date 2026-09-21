import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod/v4";
import type { Request, Response } from "express";
import {
  createTrip,
  executeTrip,
  getTrip,
  reviewSelection,
  resolveException,
  searchInventory,
  toView,
} from "./domain.js";
import { previewHtml } from "./preview.js";
import { WIDGET_URI, widgetHtml } from "./widget.js";

const uiMeta = {
  ui: { resourceUri: WIDGET_URI },
  "openai/outputTemplate": WIDGET_URI,
  "openai/widgetAccessible": true,
};

const result = (state: ReturnType<typeof getTrip>, message: string) => ({
  structuredContent: toView(state),
  content: [{ type: "text" as const, text: message }],
});

export function createServer() {
  const server = new McpServer(
    { name: "agentic-travel-commerce", version: "0.1.0" },
    {
      instructions:
        "This is a clearly labeled mock travel booking demo. The conversation is the primary interface. Start by calling create_trip_mandate, then search inventory. Let the user choose individual hotels, activities, and dining options rather than forcing a prebuilt itinerary. Never claim inventory or card charges are real. Always request explicit confirmation before confirm_and_pay.",
    },
  );

  registerAppResource(
    server,
    "Agentic Travel interactive view",
    WIDGET_URI,
    {
      description: "Compact inline cards for selection, approval, exceptions, and audit",
      _meta: { ui: { prefersBorder: true } },
    },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: widgetHtml,
          _meta: {
            ui: {
              prefersBorder: true,
              csp: { connectDomains: [], resourceDomains: [] },
            },
          },
        },
      ],
    }),
  );

  registerAppTool(
    server,
    "create_trip_mandate",
    {
      title: "旅行の支払い条件を作成",
      description:
        "旅行の依頼を開始し、予算、自動決済上限、デモシナリオを含む委任条件を作成します。旅行の相談を受けたら最初に使います。",
      inputSchema: {
        destination: z.string().default("京都"),
        startDate: z.string().default("2026-10-12"),
        endDate: z.string().default("2026-10-14"),
        travelers: z.number().int().min(1).max(8).default(2),
        budget: z.number().int().positive().default(120_000),
        autoPayLimit: z.number().int().nonnegative().default(20_000),
        scenario: z.enum(["happy", "price_change", "denied"]).default("happy"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: uiMeta,
    },
    async (input) => {
      const state = createTrip(input);
      return result(
        state,
        `Mock mandate ${state.tripId} created. Ask the user to confirm the displayed budget and approval rules before searching.`,
      );
    },
  );

  registerAppTool(
    server,
    "search_trip_inventory",
    {
      title: "旅行の候補を検索",
      description:
        "作成済みの条件に合う宿、体験、食事の候補をカテゴリ別に返します。ユーザーは候補を自由に組み合わせられます。必ずcreate_trip_mandateの後に使います。",
      inputSchema: { tripId: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: uiMeta,
    },
    async ({ tripId }) => {
      const state = searchInventory(tripId);
      return result(state, `Found ${state.inventory.length} simulated items for ${state.destination}. Ask the user to select or refine individual items.`);
    },
  );

  registerAppTool(
    server,
    "review_trip_selection",
    {
      title: "選んだ内容を確認",
      description:
        "ユーザーが個別に選んだ宿、体験、食事を保存し、合計金額と各商品の支払いポリシーを評価して承認画面を返します。",
      inputSchema: { tripId: z.string(), itemIds: z.array(z.string()).min(1).max(8) },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: uiMeta,
    },
    async ({ tripId, itemIds }) => {
      const state = reviewSelection(tripId, itemIds);
      return result(state, "The user's custom selection is ready. Explain the approval reasons and ask for explicit confirmation before sandbox payment.");
    },
  );

  registerAppTool(
    server,
    "confirm_and_pay",
    {
      title: "承認してSandbox決済",
      description:
        "明示的に選択・承認された旅程について、最新価格とポリシーを再評価し、カードSandbox決済または安全な停止を実行します。実課金はしません。",
      inputSchema: { tripId: z.string() },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: uiMeta,
    },
    async ({ tripId }) => {
      const state = executeTrip(tripId);
      const message = state.status === "completed"
        ? `Sandbox payment ${state.paymentId} completed. No real funds were moved.`
        : state.status === "reapproval_required"
          ? "Payment paused because the hotel price increased by 7.8%. Ask the user to reapprove or choose the alternative."
          : "Payment denied by the delegated policy. No funds were moved.";
      return result(state, message);
    },
  );

  registerAppTool(
    server,
    "resolve_trip_exception",
    {
      title: "価格変更を解決",
      description:
        "価格上昇で停止した旅程を、ユーザーの選択に従って再承認または代替ホテルへの変更で解決します。",
      inputSchema: { tripId: z.string(), action: z.enum(["reapprove", "alternative"]) },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: uiMeta,
    },
    async ({ tripId, action }) => {
      const state = resolveException(tripId, action);
      return result(state, `Exception resolved with ${action}. Sandbox payment ${state.paymentId} completed.`);
    },
  );

  registerAppTool(
    server,
    "get_trip_audit",
    {
      title: "旅行の監査履歴を表示",
      description: "旅行のポリシー判定、承認、拒否、Sandbox決済、予約状態の監査履歴を返します。",
      inputSchema: { tripId: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: uiMeta,
    },
    async ({ tripId }) => {
      const state = getTrip(tripId);
      return result(state, `Audit trail for ${tripId}: ${state.audit.length} events.`);
    },
  );

  return server;
}

export function createHttpApp(host = "127.0.0.1") {
  const app = createMcpExpressApp({ host });

  app.get("/", (_req: Request, res: Response) => {
    res.type("html").send(previewHtml);
  });

  app.get(["/widget", "/widget.html"], (_req: Request, res: Response) => {
    res.type("html").send(widgetHtml);
  });

  app.get("/domain.js", async (_req: Request, res: Response) => {
    const path = new URL(import.meta.url.endsWith('.ts') ? '../dist/src/domain.js' : './domain.js', import.meta.url);
    res.type('application/javascript').send(await readFile(path, 'utf8'));
  });

  app.post("/preview/reset", (req: Request, res: Response) => {
    const scenario = req.body?.scenario === "price_change" || req.body?.scenario === "denied"
      ? req.body.scenario
      : "happy";
    const state = createTrip({
      destination: "京都",
      startDate: "2026-10-12",
      endDate: "2026-10-14",
      travelers: 2,
      budget: 120_000,
      autoPayLimit: 20_000,
      scenario,
    });
    res.json(toView(state));
  });

  app.post("/preview/action", (req: Request, res: Response) => {
    try {
      const { name, arguments: args = {} } = req.body ?? {};
      const state = name === "search_trip_inventory"
        ? searchInventory(args.tripId)
        : name === "review_trip_selection"
          ? reviewSelection(args.tripId, args.itemIds)
          : name === "confirm_and_pay"
            ? executeTrip(args.tripId)
            : name === "resolve_trip_exception"
              ? resolveException(args.tripId, args.action)
              : name === "get_trip_audit"
                ? getTrip(args.tripId)
                : undefined;
      if (!state) throw new Error(`Unknown preview action: ${name}`);
      res.json(toView(state));
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Preview action failed" });
    }
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true, name: "agentic-travel-commerce", mcp: "/mcp", preview: "/", widget: "/widget" });
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      console.error("MCP request failed", error);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
      }
    }
  });

  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null });
  };
  app.get("/mcp", methodNotAllowed);
  app.delete("/mcp", methodNotAllowed);

  return app;
}

export function startServer(port = Number(process.env.PORT ?? 3000)) {
  const host = process.env.HOST ?? "127.0.0.1";
  const app = createHttpApp(host);
  return app.listen(port, host, () => {
    console.log(`Agentic Travel MCP listening on http://localhost:${port}/mcp`);
    console.log(`ChatGPT UI preview: http://localhost:${port}/`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
