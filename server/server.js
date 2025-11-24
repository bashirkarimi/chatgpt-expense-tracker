import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import fsExtra from "fs-extra";

const { pathExists, readJson, writeJson } = fsExtra;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "expenses.json");
const WIDGET_PATH = path.join(__dirname, "expense-widget.html");
const MCP_PATH = "/mcp";
const PORT = Number(process.env.PORT ?? 8787);

let expenses = [];

const addExpenseInputSchema = {
  name: z.string().min(1, "Name is required"),
  amount: z.number().finite(),
};

const addExpenseValidator = z.object(addExpenseInputSchema);

const normalizeExpense = (raw) => {
  if (!raw) return null;
  const id = String(raw.id ?? `expense-${Date.now()}`);
  const name = typeof raw.name === "string" ? raw.name : "";
  const amount = Number(raw.amount);
  return {
    id,
    name,
    amount: Number.isFinite(amount) ? amount : 0,
  };
};

const ensureExpensesLoaded = async () => {
  if (!(await pathExists(DATA_FILE))) {
    await writeJson(DATA_FILE, [], { spaces: 2 });
    expenses = [];
    return;
  }

  try {
    const data = await readJson(DATA_FILE);
    if (Array.isArray(data)) {
      expenses = data
        .map(normalizeExpense)
        .filter((item) => item !== null);
    } else {
      expenses = [];
    }
  } catch (error) {
    console.error("Failed to load expenses:", error);
    expenses = [];
  }
};

const persistExpenses = async () => {
  try {
    await writeJson(DATA_FILE, expenses, { spaces: 2 });
  } catch (error) {
    console.error("Failed to persist expenses:", error);
  }
};

const replyWithExpenses = (message) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { expenses },
});

const readRequestBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
};

const sendJson = (res, statusCode, data) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.writeHead(statusCode).end(JSON.stringify(data));
};

const createExpenseMcpServer = () => {
  const server = new McpServer({ name: "expense-tracker", version: "0.1.0" });

  server.registerResource(
    "expense-widget",
    "ui://widget/expense-tracker.html",
    {},
    async () => {
      const widgetHtml = await readFile(WIDGET_PATH, "utf8");
      return {
        contents: [
          {
            uri: "ui://widget/expense-tracker.html",
            mimeType: "text/html+skybridge",
            text: widgetHtml,
            _meta: { "openai/widgetPrefersBorder": true },
          },
        ],
      };
    }
  );

  server.registerTool(
    "list_expenses",
    {
      title: "List expenses",
      description: "Returns the full list of expenses.",
      _meta: {
        "openai/outputTemplate": "ui://widget/expense-tracker.html",
        "openai/toolInvocation/invoking": "Loading expenses",
        "openai/toolInvocation/invoked": "Loaded expenses",
      },
    },
    async () => {
      await ensureExpensesLoaded();
      return replyWithExpenses();
    }
  );

  server.registerTool(
    "add_expense",
    {
      title: "Add expense",
      description: "Adds a new expense item with a name and amount.",
      inputSchema: addExpenseInputSchema,
      _meta: {
        "openai/outputTemplate": "ui://widget/expense-tracker.html",
        "openai/toolInvocation/invoking": "Saving expense",
        "openai/toolInvocation/invoked": "Saved expense",
      },
    },
    async (args) => {
      const result = addExpenseValidator.safeParse(args ?? {});
      if (!result.success) {
        const message = result.error.issues
          .map((issue) => issue.message)
          .join("; ");
        return replyWithExpenses(`Invalid expense: ${message}`);
      }

      await ensureExpensesLoaded();
      const amount = Number(result.data.amount);
      const newExpense = {
        id: `expense-${Date.now()}`,
        name: result.data.name.trim(),
        amount,
      };

      expenses = [...expenses, newExpense];
      await persistExpenses();

      return replyWithExpenses(
        `Added "${newExpense.name}" for $${amount.toFixed(2)}.`
      );
    }
  );

  return server;
};

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS") {
    const isMcpRoute = url.pathname === MCP_PATH;
    if (isMcpRoute) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, mcp-session-id",
        "Access-Control-Expose-Headers": "Mcp-Session-Id",
      });
    } else {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      });
    }
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" }).end(
      "Expense MCP server"
    );
    return;
  }

  if (req.method === "GET" && url.pathname === "/expenses") {
    await ensureExpensesLoaded();
    sendJson(res, 200, expenses);
    return;
  }

  if (req.method === "POST" && url.pathname === "/expenses") {
    try {
      const rawBody = await readRequestBody(req);
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const name = typeof payload.name === "string" ? payload.name.trim() : "";
      const amount = Number(payload.amount);

      if (!name || !Number.isFinite(amount)) {
        sendJson(res, 400, { error: "Invalid expense payload" });
        return;
      }

      await ensureExpensesLoaded();
      const newExpense = {
        id: `expense-${Date.now()}`,
        name,
        amount,
      };
      expenses = [...expenses, newExpense];
      await persistExpenses();
      sendJson(res, 201, newExpense);
    } catch (error) {
      console.error("Failed to handle /expenses POST:", error);
      sendJson(res, 500, { error: "Failed to save expense" });
    }
    return;
  }

  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    if (req.method === "GET") {
      const acceptHeader = req.headers.accept ?? "";
      const acceptsEventStream = acceptHeader.includes("text/event-stream");
      const acceptsJson = acceptHeader.includes("application/json");

      if (!acceptsEventStream && !acceptsJson) {
        res
          .writeHead(200, { "content-type": "text/plain" })
          .end(
            "Expense MCP endpoint. Use an MCP client or send Accept: text/event-stream."
          );
        return;
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createExpenseMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await ensureExpensesLoaded();
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

const start = async () => {
  await ensureExpensesLoaded();
  httpServer.listen(PORT, () => {
    console.log(
      `Expense MCP server listening on http://localhost:${PORT}${MCP_PATH}`
    );
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});
