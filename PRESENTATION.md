# 💰 ChatGPT Expense Tracker
### MCP-Powered Expense Management


---

## 🎯 What is Model Context Protocol (MCP)?

The **Model Context Protocol** is an open specification for connecting large language model clients (like ChatGPT) to external tools and resources. Think of it as the **"USB standard for AI applications"** - a universal way for AI models to interact with your services.

### Core Concepts

**MCP Server** - Your backend service that:
- Exposes **tools** that AI models can invoke
- Returns **structured data** for model reasoning
- Serves **UI resources** (HTML widgets) for rich user experiences
- Handles **authentication** and **authorization**

**MCP Client** - The AI application (ChatGPT) that:
- Discovers available tools through MCP
- Invokes tools based on user intent
- Renders widgets returned by tools
- Maintains conversation context

### Why MCP Matters

| Traditional Approach | With MCP |
|---------------------|----------|
| Custom APIs for each AI platform | Single standardized protocol |
| Manual tool discovery | Automatic tool listing & schemas |
| Separate UI and data channels | Unified structured responses |
| Platform-specific authentication | OAuth 2.1 built-in |
| Client-specific code | Works across web, mobile, desktop |

### MCP Protocol Building Blocks

1. **List Tools** - Advertise available functions with JSON Schema
2. **Call Tools** - Execute actions with validated parameters
3. **Return Components** - Serve HTML widgets alongside data
4. **Manage Resources** - Provide static or dynamic content
5. **Handle Authentication** - OAuth flows and protected resources

---

## 🔌 OpenAI Apps SDK Overview

The **OpenAI Apps SDK** is the framework for building ChatGPT applications using MCP. It provides:

### 1. Widget Runtime (Skybridge)

A secure sandbox that runs your React components inside ChatGPT:

```
┌─────────────────────────────────────────────┐
│         ChatGPT Interface                   │
│  ┌───────────────────────────────────────┐  │
│  │  User's Conversation                  │  │
│  ├───────────────────────────────────────┤  │
│  │  🤖 Assistant:"Here are your expenses"│  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │   Skybridge iframe              │  │  │
│  │  │   ┌───────────────────────┐     │  │  │
│  │  │   │  Your HTML Widget     │     │  │  |
│  │  │   │  (expense-tracker)    │     │  │  │
│  │  │   └───────────────────────┘     │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 2. `window.openai` Bridge API

The communication layer between your widget and ChatGPT:

```typescript
interface WindowOpenAI {
  // State & Data
  toolInput: object;           // Parameters passed to current tool
  toolOutput: object | null;   // Structured data from tool execution
  toolResponseMetadata: object;// Server metadata (hidden from model)
  widgetState: object | null;  // Persisted component state
  
  // UI Context
  theme: "light" | "dark";     // Current ChatGPT theme
  locale: string;              // User's language (BCP 47)
  displayMode: "inline" | "pip" | "fullscreen";
  maxHeight: number;           // Available height in pixels
  safeArea: SafeArea;          // Notch/inset information
  userAgent: UserAgent;        // Device capabilities
  
  // Actions
  callTool(name: string, args: object): Promise<ToolResponse>;
  sendFollowUpMessage(args: {prompt: string}): Promise<void>;
  setWidgetState(state: object): Promise<void>;
  requestDisplayMode(args: {mode: DisplayMode}): Promise<{mode}>;
  requestClose(): void;
  openExternal(args: {href: string}): void;
}
```

### 3. Global State Events

Widgets subscribe to state changes via custom events:

```typescript
// Event fired when tool executes or state updates
window.addEventListener("openai:set_globals", (event: CustomEvent) => {
  const { toolOutput, theme, displayMode } = event.detail.globals;
  // React to changes
});
```

### 4. Complete Integration Flow

```
User types: "Show my expenses"
         ↓
ChatGPT analyzes intent
         ↓
Invokes MCP tool: list_expenses
         ↓
Your MCP server executes
         ↓
Returns: {
  structuredContent: { expenses: [...] },
  _meta: { outputTemplate: "ui://widget/expense-tracker.html" }
}
         ↓
ChatGPT loads widget HTML in iframe
         ↓
Widget reads window.openai.toolOutput.expenses
         ↓
React renders expense list
         ↓
User clicks "Add" button in widget
         ↓
Widget calls: window.openai.callTool("add_expense", {...})
         ↓
MCP server processes request
         ↓
Returns updated expenses
         ↓
Event "openai:set_globals" fires
         ↓
Widget re-renders with new data
```

---

## 📋 Project Overview

A modern expense tracking application that seamlessly integrates with ChatGPT using the **Model Context Protocol (MCP)**. This project demonstrates how to build applications that work both as standalone web apps and as embedded widgets within ChatGPT conversations.

### Key Highlights
- 🤖 **ChatGPT Integration** via MCP SDK and OpenAI App SDK
- ⚛️ **React Frontend** with intelligent dual-mode operation
- 🔧 **Node.js MCP Server** implementing Model Context Protocol
- 📦 **Single-File Widget** with zero external dependencies
- 🔄 **Real-time Synchronization** between ChatGPT and widget UI

---

## 🏗️ Architecture

### Three-Tier System

```
┌─────────────────────────────────────────────────┐
│           React Client (Port 3000)              │
│  ┌──────────────────────────────────────────┐  │
│  │  • Expense Form Component                │  │
│  │  • Expense List Component                │  │
│  │  • OpenAI Bridge (ChatGPT Integration)   │  │
│  └──────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Node.js Server (Port 8787)              │
│  ┌──────────────────────────────────────────┐  │
│  │  • MCP Server (Model Context Protocol)   │  │
│  │  • REST API Endpoints                    │  │
│  │  • Widget HTML Serving                   │  │
│  └──────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Data Layer                         │
│           expenses.json (File Store)            │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Key Technologies

### Frontend
- **React 19.2** - UI framework with hooks
- **OpenAI App SDK** - ChatGPT widget integration via `window.openai`
- **Custom Bridge Layer** (`openaiBridge.js`) - Environment detection and tool invocation

### Backend
- **Node.js** (ESM modules)
- **@modelcontextprotocol/sdk** v1.21.1 - Official MCP SDK
- **StreamableHTTPServerTransport** - HTTP-based MCP transport
- **Zod** v3.25 - Schema validation for MCP tools

### Integration Points
- **MCP Resources** - Widget HTML serving
- **MCP Tools** - Expense operations exposed to ChatGPT
- **Event-Driven Updates** - Real-time UI synchronization

---

## 🌟 Apps SDK Advanced Capabilities

### Widget Display Modes

Your widget can request different presentation modes based on content needs:

#### 1. Inline Mode (Default)
```typescript
// Embedded directly in conversation
// Good for: Lists, cards, quick actions
// Height: Limited by window.openai.maxHeight
```

#### 2. Picture-in-Picture (PiP)
```typescript
await window.openai.requestDisplayMode({ mode: "pip" });
// Floating overlay while user continues chatting
// Good for: Media players, timers, monitoring dashboards
```

#### 3. Fullscreen
```typescript
await window.openai.requestDisplayMode({ mode: "fullscreen" });
// Takes over entire ChatGPT canvas
// Good for: Complex forms, maps, data tables, editors
```

### Widget State Management

The Apps SDK provides **persistent state** scoped to each widget instance:

```typescript
// Save state (exposed to ChatGPT model + persisted)
await window.openai.setWidgetState({
  currentFilter: "monthly",
  selectedCategories: ["food", "transport"],
  lastSync: Date.now()
});

// Read state
const state = window.openai.widgetState;

// Subscribe to state changes
window.addEventListener("openai:set_globals", (e) => {
  const newState = e.detail.globals.widgetState;
});
```

**State Characteristics:**
- ✅ Persisted across page reloads
- ✅ Visible to ChatGPT for context
- ✅ Scoped to specific message/widget
- ⚠️ Keep under 4K tokens for performance
- ⚠️ New conversation = fresh state

### Tool Metadata Annotations

Control how ChatGPT presents and executes your tools:

```typescript
server.registerTool("list_expenses", {
  title: "List Expenses",
  description: "Returns the full list of expenses.",
  inputSchema: { /* ... */ },
  annotations: {
    readOnlyHint: true,        // Skip confirmation prompts
    destructiveHint: false,    // Not deleting data
    openWorldHint: false       // Not publishing externally
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/expense-tracker.html",
    "openai/widgetAccessible": false,  // Can widget call this tool?
    "openai/visibility": "public",     // "public" or "private"
    "openai/toolInvocation/invoking": "Loading expenses...",
    "openai/toolInvocation/invoked": "Expenses loaded",
    "openai/widgetDescription": "Interactive expense tracker with add/list"
  }
});
```

### Widget Resource Metadata

Configure how your widget renders in ChatGPT:

```typescript
server.registerResource(
  "expense-widget",
  "ui://widget/expense-tracker.html",
  {},
  async () => ({
    contents: [{
      uri: "ui://widget/expense-tracker.html",
      mimeType: "text/html+skybridge",  // Special ChatGPT widget format
      text: widgetHtml,
      _meta: {
        "openai/widgetDescription": "Expense tracker with add and list capabilities",
        "openai/widgetPrefersBorder": true,  // Show border around widget
        "openai/widgetDomain": "https://your-app.vercel.app",
        "openai/widgetCSP": {
          connect_domains: ["https://your-api.vercel.app"],
          resource_domains: ["https://*.oaistatic.com"]
        }
      }
    }]
  })
);
```

### Conversational Follow-ups

Widgets can trigger new conversation turns programmatically:

```typescript
// User clicks "Generate Report" in widget
async function generateReport() {
  await window.openai.sendFollowUpMessage({
    prompt: "Create a monthly expense report based on the expenses I've added"
  });
  // ChatGPT continues conversation as if user typed this
}
```

### Host-Backed Navigation

Widgets support client-side routing that syncs with ChatGPT's UI:

```typescript
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

function ExpenseWidget() {
  const navigate = useNavigate();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExpenseList />} />
        <Route path="/expense/:id" element={<ExpenseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

// Navigation updates ChatGPT's back button
function openExpenseDetail(id) {
  navigate(`/expense/${id}`, { replace: false });
}
```

### Localization Support

Widgets receive user's locale and can adapt accordingly:

```typescript
import { IntlProvider } from 'react-intl';

function App() {
  const locale = window.openai.locale ?? 'en-US';
  const messages = {
    'en-US': { greeting: 'Hello', addExpense: 'Add Expense' },
    'es-ES': { greeting: 'Hola', addExpense: 'Agregar Gasto' },
    'fr-FR': { greeting: 'Bonjour', addExpense: 'Ajouter une Dépense' }
  };
  
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <ExpenseTracker />
    </IntlProvider>
  );
}
```

### Theme Awareness

Widgets automatically receive and can respond to ChatGPT's theme:

```typescript
import { useOpenAiGlobal } from './hooks';

function ExpenseCard() {
  const theme = useOpenAiGlobal('theme'); // "light" or "dark"
  
  return (
    <div className={`card card-${theme}`}>
      {/* Adapts styling based on ChatGPT theme */}
    </div>
  );
}
```

### Security: Content Security Policy (CSP)

ChatGPT enforces strict CSP for widgets. Declare allowed domains:

```typescript
_meta: {
  "openai/widgetCSP": {
    connect_domains: [
      "https://api.yourdomain.com",     // API calls
      "https://auth.yourdomain.com"     // OAuth
    ],
    resource_domains: [
      "https://cdn.yourdomain.com",     // Static assets
      "https://*.oaistatic.com"         // OpenAI CDN
    ]
  }
}
```

**CSP Rules:**
- ✅ No inline scripts (use bundled JS)
- ✅ No external scripts (inline everything)
- ✅ Declare all fetch() destinations
- ✅ No eval() or Function()

### User Context Hints

MCP servers receive contextual information about the user:

```typescript
server.registerTool("recommend_expenses", {
  title: "Recommend budget allocation",
  inputSchema: { type: "object" }
}, async (args, { _meta }) => {
  // Available context
  const locale = _meta?.["openai/locale"];           // "en-US"
  const userAgent = _meta?.["openai/userAgent"];     // Device info
  const location = _meta?.["openai/userLocation"];   // { city, country, timezone }
  const userId = _meta?.["openai/subject"];          // Anonymized ID for rate limiting
  
  // Use for personalization, NOT authorization
  return formatResponse(locale, location);
});
```

⚠️ **Important:** These hints are for UX, not security. Never use for authorization decisions.

---

## 🎯 Core Features

### 1. Dual-Mode Operation with Environment Detection

The application intelligently detects its runtime environment and adapts its behavior:

#### Standalone Mode (Traditional Web App)
```javascript
// REST API communication
getExpenses().then(setExpenses);
await addExpense({ name: "Coffee", amount: 5.50 });
```

#### ChatGPT Mode (MCP Integration)
```javascript
// MCP tool invocation through OpenAI App SDK
const expenses = await callExpenseTool("list_expenses", {});
await callExpenseTool("add_expense", { name: "Lunch", amount: 12.00 });
```

### 2. Smart Environment Detection

The app uses the OpenAI App SDK to detect ChatGPT context:

```javascript
export const isOpenAIEnvironment = () => Boolean(window.openai);
```

**Decision Logic:**
- **`window.openai` exists** → Use MCP tools via OpenAI App SDK
- **`window.openai` missing** → Use REST API

This allows the same React build to work seamlessly in both environments without modifications.

---

## 🔌 OpenAI App SDK Integration

### The Bridge Layer (`openaiBridge.js`)

This file is the **heart of ChatGPT integration**, providing a clean abstraction over the OpenAI App SDK.

### Key Functions

#### 1. Environment Detection
```javascript
const hasWindow = typeof window !== "undefined";

const getOpenAIObject = () => {
  if (!hasWindow) return null;
  return window.openai ?? null;
};

export const isOpenAIEnvironment = () => Boolean(getOpenAIObject());
```
- Safely checks for browser environment
- Detects `window.openai` object injected by ChatGPT
- Returns boolean for conditional logic

#### 2. Reading Initial State
```javascript
export const readExpensesFromOpenAI = () => {
  const openai = getOpenAIObject();
  if (!openai?.toolOutput?.expenses) return null;
  return Array.isArray(openai.toolOutput.expenses)
    ? [...openai.toolOutput.expenses]
    : null;
};
```
- Reads initial data from `window.openai.toolOutput`
- Populated by MCP server's structured response
- Returns cloned array to prevent mutations

#### 3. Real-Time Updates via Events
```javascript
export const subscribeToOpenAIGlobals = (callback) => {
  if (!isOpenAIEnvironment()) return () => {};
  
  const handler = (event) => {
    const nextExpenses = event.detail?.globals?.toolOutput?.expenses;
    if (!Array.isArray(nextExpenses)) return;
    callback(nextExpenses);
  };

  window.addEventListener("openai:set_globals", handler, { passive: true });
  return () => window.removeEventListener("openai:set_globals", handler);
};
```
- Subscribes to ChatGPT's global state updates
- Event: `openai:set_globals` fired when MCP tools execute
- Enables reactive UI updates without polling
- Returns cleanup function for proper unmounting

#### 4. Tool Invocation
```javascript
export const callExpenseTool = async (name, payload) => {
  const openai = getOpenAIObject();
  if (!openai?.callTool) return null;
  
  const response = await openai.callTool(name, payload);
  const expenses = response?.structuredContent?.expenses;
  return Array.isArray(expenses) ? expenses : null;
};
```
- Invokes MCP tools through `window.openai.callTool()`
- Passes tool name and parameters
- Extracts structured data from response
- Returns updated expense array

### OpenAI App SDK Contract

The `window.openai` object provides:

| Property/Method | Purpose | Type |
|----------------|---------|------|
| `toolOutput` | Initial state from last tool execution | `Object` |
| `callTool(name, args)` | Invoke MCP tool | `Function → Promise` |
| Events: `openai:set_globals` | Notify UI of state changes | `CustomEvent` |

---

## 📡 MCP Server Implementation

### Server Registration with MCP SDK

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const createExpenseMcpServer = () => {
  const server = new McpServer({ 
    name: "expense-tracker", 
    version: "0.1.0" 
  });
  
  // Register resources and tools...
  
  return server;
};
```

### MCP Resources: Widget HTML

Resources in MCP represent static or dynamic content that can be referenced by tools.

```javascript
server.registerResource(
  "expense-widget",                          // Resource ID
  "ui://widget/expense-tracker.html",        // URI scheme
  {},                                         // Metadata
  async () => {
    const widgetHtml = await readFile(WIDGET_PATH, "utf8");
    return {
      contents: [{
        uri: "ui://widget/expense-tracker.html",
        mimeType: "text/html+skybridge",     // OpenAI widget format
        text: widgetHtml,
        _meta: { 
          "openai/widgetPrefersBorder": true  // UI preference
        }
      }]
    };
  }
);
```

**Key Points:**
- `text/html+skybridge` - Special MIME type for ChatGPT widgets
- Widget HTML contains inlined React app (no external dependencies)
- `_meta` provides rendering hints to ChatGPT UI

### MCP Tools: Expense Operations

Tools are executable functions that ChatGPT can invoke during conversations.

#### Tool 1: List Expenses

```javascript
server.registerTool(
  "list_expenses",                           // Tool name
  {
    title: "List expenses",
    description: "Returns the full list of expenses.",
    _meta: {
      "openai/outputTemplate": "ui://widget/expense-tracker.html",
      "openai/toolInvocation/invoking": "Loading expenses",
      "openai/toolInvocation/invoked": "Loaded expenses"
    }
  },
  async () => {
    await ensureExpensesLoaded();
    return {
      content: [],                           // Text response (optional)
      structuredContent: { expenses }        // Data for widget
    };
  }
);
```

**MCP Meta Annotations:**
- `openai/outputTemplate` - Links tool output to widget resource
- `openai/toolInvocation/invoking` - Progress message during execution
- `openai/toolInvocation/invoked` - Completion message

#### Tool 2: Add Expense

```javascript
server.registerTool(
  "add_expense",
  {
    title: "Add expense",
    description: "Adds a new expense item with a name and amount.",
    inputSchema: {                           // Zod schema as JSON Schema
      name: z.string().min(1, "Name is required"),
      amount: z.number().finite()
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/expense-tracker.html",
      "openai/toolInvocation/invoking": "Saving expense",
      "openai/toolInvocation/invoked": "Saved expense"
    }
  },
  async (args) => {
    const result = addExpenseValidator.safeParse(args ?? {});
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join("; ");
      return {
        content: [{ type: "text", text: `Invalid expense: ${message}` }],
        structuredContent: { expenses }
      };
    }

    await ensureExpensesLoaded();
    const newExpense = {
      id: `expense-${Date.now()}`,
      name: result.data.name.trim(),
      amount: Number(result.data.amount)
    };

    expenses = [...expenses, newExpense];
    await persistExpenses();

    return {
      content: [{ 
        type: "text", 
        text: `Added "${newExpense.name}" for $${newExpense.amount.toFixed(2)}.`
      }],
      structuredContent: { expenses }        // Updated list for widget
    };
  }
);
```

**Input Schema:**
- Defined using Zod for type safety
- Automatically converted to JSON Schema for MCP
- Provides validation and error messages

**Return Format:**
```typescript
// Tool response structure
{
  content: [                             // Text for ChatGPT + user
    { type: "text", text: "Added expense successfully" }
  ],
  structuredContent: {                   // Data for model reasoning + widget
    expenses: [...],
    total: 123.45
  },
  _meta: {                              // Hidden from model, sent to widget only
    allExpensesById: {...},              // Additional data for UI
    serverTimestamp: 1701432000,
    openai/closeWidget: false            // Control widget visibility
  }
}
```

**Key Distinctions:**
- `content` → Shown to model AND user in conversation
- `structuredContent` → Available to model for reasoning + widget for rendering
- `_meta` → Only sent to widget (hidden from model's context)

### HTTP Transport Layer

```javascript
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,             // Auto-generate sessions
  enableJsonResponse: true                   // Support JSON + SSE
});

await server.connect(transport);
await transport.handleRequest(req, res);
```

**StreamableHTTPServerTransport Features:**
- Handles HTTP → MCP protocol conversion
- Supports Server-Sent Events (SSE) for streaming
- Manages session lifecycle
- Automatically sets proper CORS headers

---

## 🔄 Complete Data Flow

### Scenario: User Adds Expense via ChatGPT

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User Input                                         │
│  "Add lunch expense for $15"                                │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: ChatGPT Interprets Intent                          │
│  - Parses natural language                                  │
│  - Identifies tool: add_expense                             │
│  - Extracts parameters: {name: "lunch", amount: 15}         │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: MCP Tool Invocation                                │
│  POST /mcp                                                  │
│  {                                                          │
│    "method": "tools/call",                                  │
│    "params": {                                              │
│      "name": "add_expense",                                 │
│      "arguments": {                                         │
│        "name": "lunch",                                     │
│        "amount": 15                                         │
│      }                                                      │
│    }                                                        │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: MCP Server Processing                              │
│  - McpServer routes to add_expense handler                  │
│  - Zod validates input schema                               │
│  - Creates expense object with ID                           │
│  - Persists to expenses.json                                │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: MCP Response                                       │
│  {                                                          │
│    "content": [{                                            │
│      "type": "text",                                        │
│      "text": "Added 'lunch' for $15.00."                    │
│    }],                                                      │
│    "structuredContent": {                                   │
│      "expenses": [                                          │
│        {id: "expense-1701432000", name: "lunch", amount: 15}│
│      ]                                                      │
│    }                                                        │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: ChatGPT Updates Widget                             │
│  - Sets window.openai.toolOutput.expenses                   │
│  - Dispatches "openai:set_globals" event                    │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 7: React Widget Updates                               │
│  - subscribeToOpenAIGlobals() catches event                 │
│  - Calls setExpenses() with new data                        │
│  - React re-renders expense list                            │
└─────────────────────────────────────────────────────────────┘
```

### User Adds Expense Directly in Widget

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User Interaction                                   │
│  - Fills form: "Coffee", "$5.50"                            │
│  - Clicks "Add" button                                      │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: React Event Handler                                │
│  const handleAdd = async (expense) => {                     │
│    if (isOpenAIEnvironment()) {                             │
│      const updated = await callExpenseTool(                 │
│        "add_expense",                                       │
│        {name: "Coffee", amount: 5.50}                       │
│      );                                                     │
│      setExpenses(updated);                                  │
│    }                                                        │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: OpenAI App SDK Call                                │
│  window.openai.callTool("add_expense", {                    │
│    name: "Coffee",                                          │
│    amount: 5.50                                             │
│  })                                                         │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4-5: Same as ChatGPT flow                             │
│  - MCP server processes                                     │
│  - Returns structured response                              │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Direct State Update                                │
│  - callExpenseTool() returns updated array                  │
│  - setExpenses() called immediately                         │
│  - React re-renders instantly                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Differences

| Aspect | Via ChatGPT | Via Widget UI |
|--------|-------------|---------------|
| **Trigger** | Natural language | Direct UI interaction |
| **Tool Call** | ChatGPT → MCP | `window.openai.callTool()` |
| **Update Mechanism** | Event dispatch | Function return value |
| **UI Feedback** | Event listener | State setter |

---

## 🧩 React Component Integration

### `App.jsx` - Main Application Container

The core orchestration layer that manages environment-aware data loading and synchronization.

#### Initial Load Strategy

```javascript
useEffect(() => {
  // Priority 1: Check if data already in window.openai
  const openaiExpenses = readExpensesFromOpenAI();
  if (openaiExpenses) {
    setExpenses(openaiExpenses);
    return;
  }
  
  // Priority 2: In ChatGPT but no initial data → fetch via MCP
  if (isOpenAIEnvironment()) {
    callExpenseTool("list_expenses", {}).then((updated) => {
      if (updated) setExpenses(updated);
    });
    return;
  }
  
  // Priority 3: Standalone mode → use REST API
  getExpenses().then(setExpenses);
}, []);
```

**Loading Priority Logic:**
1. **Initial State Read** - Fastest, uses pre-populated data from last tool execution
2. **MCP Tool Call** - Fetches fresh data when in ChatGPT without cache
3. **REST API** - Fallback for standalone web deployment

#### Real-Time Synchronization

```javascript
useEffect(() => {
  if (!isOpenAIEnvironment()) return undefined;
  
  // Subscribe to ChatGPT's global state changes
  return subscribeToOpenAIGlobals((nextExpenses) => {
    setExpenses(nextExpenses);
  });
}, []);
```

**Why This Matters:**
- When user invokes tools via ChatGPT conversation, widget updates automatically
- No polling required - event-driven architecture
- Returns cleanup function to prevent memory leaks

#### Conditional Add Handler

```javascript
const handleAdd = async (expense) => {
  const normalized = {
    name: expense.name.trim(),
    amount: Number(expense.amount)
  };

  if (!normalized.name || Number.isNaN(normalized.amount)) return;

  if (isOpenAIEnvironment()) {
    // ChatGPT mode: Use MCP tools
    const updatedExpenses = await callExpenseTool("add_expense", normalized);
    if (updatedExpenses) {
      setExpenses(updatedExpenses);
    }
    return;
  }

  // Standalone mode: Use REST API
  const saved = await addExpense(normalized);
  setExpenses((prev) => [...prev, saved]);
};
```

**Smart Routing:**
- Same handler for both environments
- Runtime decision based on `isOpenAIEnvironment()`
- Different backend, same UX

### Component Communication Flow

```
┌──────────────────────────────────────────────────────┐
│                     App.jsx                          │
│  ┌────────────────────────────────────────────────┐ │
│  │  State: [expenses, setExpenses]               │ │
│  │  Handler: handleAdd(expense)                  │ │
│  └────────┬─────────────────────────┬─────────────┘ │
│           │                         │               │
│           ▼                         ▼               │
│  ┌─────────────────┐      ┌──────────────────┐    │
│  │ ExpenseForm     │      │  ExpenseList     │    │
│  │ onAdd={handleAdd}│      │  expenses={...}  │    │
│  └─────────────────┘      └──────────────────┘    │
└──────────────────────────────────────────────────────┘
         │                            ▲
         │ User submits form          │ Display updates
         ▼                            │
┌──────────────────────────────────────────────────────┐
│              openaiBridge.js                         │
│  ┌────────────────────────────────────────────────┐ │
│  │  callExpenseTool() → window.openai.callTool()  │ │
│  │  subscribeToOpenAIGlobals() → addEventListener  │ │
│  └────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────┬────┘
                 │                                │
                 ▼                                ▼
         MCP Tool Invocation            Event Listening
                 │                                │
                 ▼                                ▼
       ┌──────────────────┐          ┌──────────────────┐
       │   MCP Server     │          │  ChatGPT System  │
       │  /mcp endpoint   │          │  Event Emitter   │
       └──────────────────┘          └──────────────────┘
```

---

## 🚀 REST API Endpoints

### `GET /`
Returns server status message

### `GET /expenses`
```json
[
  { "id": "expense-1701432000000", "name": "Coffee", "amount": 5.50 },
  { "id": "expense-1701432100000", "name": "Lunch", "amount": 12.00 }
]
```

### `POST /expenses`
**Request:**
```json
{ "name": "Dinner", "amount": 25.00 }
```

**Response:**
```json
{ "id": "expense-1701432200000", "name": "Dinner", "amount": 25.00 }
```

### `POST /mcp` (MCP Endpoint)
- Accepts MCP protocol requests
- Returns SSE or JSON responses
- Session management built-in

---

## 🛠️ Widget Build Process

### The Challenge

ChatGPT widgets must be **single HTML files** with no external dependencies. This requires:
- Inlining all CSS
- Inlining all JavaScript
- No network requests after initial load

### Solution: `embed-react-widget.mjs`

This build script transforms the React production build into a self-contained widget.

#### Build Pipeline

```
React Build (npm run build)
         ↓
┌─────────────────────────────────────┐
│  build/                             │
│  ├── static/css/main.*.css          │
│  ├── static/js/main.*.js            │
│  ├── static/js/453.*.chunk.js       │
│  └── asset-manifest.json            │
└─────────────────────────────────────┘
         ↓
  embed-react-widget.mjs
         ↓
    1. Read asset-manifest.json
    2. Load all CSS files → inline in <style>
    3. Load all JS files → inline in <script>
    4. Generate HTML with React root div
    5. Write to server/expense-widget.html
         ↓
┌─────────────────────────────────────┐
│  expense-widget.html (~50KB)        │
│  ├── <style>...all CSS...</style>   │
│  ├── <div id="root"></div>          │
│  └── <script>...all JS...</script>  │
└─────────────────────────────────────┘
```

#### Script Workflow

```javascript
// 1. Parse asset manifest
const manifest = await readJson('./build/asset-manifest.json');
const { files } = manifest;

// 2. Extract CSS
const cssFiles = Object.values(files).filter(f => f.endsWith('.css'));
const cssContent = await Promise.all(
  cssFiles.map(f => readFile(`./build${f}`, 'utf8'))
);

// 3. Extract JS
const jsFiles = Object.values(files).filter(f => f.endsWith('.js'));
const jsContent = await Promise.all(
  jsFiles.map(f => readFile(`./build${f}`, 'utf8'))
);

// 4. Generate single HTML
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>${cssContent.join('\n')}</style>
</head>
<body>
  <div id="root"></div>
  <script>${jsContent.join('\n')}</script>
</body>
</html>
`;

// 5. Write to server directory
await writeFile('../server/expense-widget.html', html);
```

### Why This Matters for MCP

The MCP server serves this widget file when ChatGPT requests the resource:

```javascript
server.registerResource(
  "expense-widget",
  "ui://widget/expense-tracker.html",
  {},
  async () => {
    const widgetHtml = await readFile(WIDGET_PATH, "utf8");
    return {
      contents: [{
        uri: "ui://widget/expense-tracker.html",
        mimeType: "text/html+skybridge",
        text: widgetHtml  // ← Single-file HTML with everything inlined
      }]
    };
  }
);
```

**Benefits:**
- ✅ Zero external dependencies
- ✅ Instant rendering (no asset loading)
- ✅ Works in isolated ChatGPT iframe
- ✅ Single HTTP request

---

## 🔗 MCP Protocol Details

### HTTP Transport Configuration

The server uses `StreamableHTTPServerTransport` to handle MCP over HTTP.

```javascript
const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // MCP endpoint at /mcp
  if (url.pathname === MCP_PATH && ["POST", "GET", "DELETE"].includes(req.method)) {
    
    // Set CORS headers for cross-origin access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    
    // Create new MCP server instance
    const server = createExpenseMcpServer();
    
    // Create transport with configuration
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,      // Auto-generate session IDs
      enableJsonResponse: true            // Support both SSE and JSON
    });
    
    // Cleanup on connection close
    res.on("close", () => {
      transport.close();
      server.close();
    });
    
    // Connect and handle
    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }
});
```

### MCP Request/Response Format

#### Tool Invocation Request

```json
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "add_expense",
    "arguments": {
      "name": "Groceries",
      "amount": 45.67
    }
  }
}
```

#### MCP Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Added 'Groceries' for $45.67."
      }
    ],
    "structuredContent": {
      "expenses": [
        {
          "id": "expense-1701432000000",
          "name": "Groceries",
          "amount": 45.67
        }
      ]
    }
  }
}
```

### Resource Discovery

ChatGPT can discover available resources:

```json
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/list",
  "params": {}
}
```

Response includes the widget resource:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "resources": [
      {
        "uri": "ui://widget/expense-tracker.html",
        "name": "expense-widget",
        "mimeType": "text/html+skybridge"
      }
    ]
  }
}
```

### Tool Discovery

```json
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/list",
  "params": {}
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "tools": [
      {
        "name": "list_expenses",
        "description": "Returns the full list of expenses.",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      },
      {
        "name": "add_expense",
        "description": "Adds a new expense item with a name and amount.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "minLength": 1
            },
            "amount": {
              "type": "number"
            }
          },
          "required": ["name", "amount"]
        }
      }
    ]
  }
}
```

---

## 📊 State Synchronization Architecture

### Three State Sources

```
┌─────────────────────────────────────────────────────────┐
│  1. Server State (Source of Truth)                     │
│     expenses.json                                       │
│     [{"id": "...", "name": "...", "amount": ...}]       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  2. MCP Server Memory                                   │
│     let expenses = []                                   │
│     Loaded on startup + each request                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  3. ChatGPT Context                                     │
│     window.openai.toolOutput.expenses                   │
│     Updated after each tool execution                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  4. React Widget State                                  │
│     const [expenses, setExpenses] = useState([])        │
│     Synced via events and tool calls                    │
└─────────────────────────────────────────────────────────┘
```

### Synchronization Flows

#### Flow 1: Tool Execution via ChatGPT

```
User → ChatGPT → MCP Tool → Server State → MCP Response
                                              ↓
                                   window.openai.toolOutput
                                              ↓
                                   "openai:set_globals" event
                                              ↓
                                   Widget subscribeToOpenAIGlobals
                                              ↓
                                   setExpenses(newData)
```

#### Flow 2: Direct Widget Interaction

```
User → Widget UI → handleAdd → callExpenseTool
                                   ↓
                         window.openai.callTool
                                   ↓
                         MCP Server → Server State
                                   ↓
                         MCP Response with structuredContent
                                   ↓
                         Return to callExpenseTool
                                   ↓
                         setExpenses(response.expenses)
```

### Ensuring Consistency

```javascript
const ensureExpensesLoaded = async () => {
  if (!(await pathExists(DATA_FILE))) {
    await writeJson(DATA_FILE, [], { spaces: 2 });
    expenses = [];
    return;
  }

  try {
    const data = await readJson(DATA_FILE);
    if (Array.isArray(data)) {
      expenses = data.map(normalizeExpense).filter(Boolean);
    } else {
      expenses = [];
    }
  } catch (error) {
    console.error("Failed to load expenses:", error);
    expenses = [];
  }
};
```

Called before every tool execution to ensure fresh data.

---

## 🎨 OpenAI-Specific Metadata

### Widget Rendering Preferences

MCP resources can include OpenAI-specific metadata to control widget appearance:

```javascript
_meta: { 
  "openai/widgetPrefersBorder": true 
}
```

**Available Options:**
- `openai/widgetPrefersBorder` - Adds border around widget in ChatGPT UI

### Tool Invocation Messages

Provides user feedback during async operations:

```javascript
_meta: {
  "openai/toolInvocation/invoking": "Saving expense",
  "openai/toolInvocation/invoked": "Saved expense"
}
```

**User Experience:**
```
User: "Add coffee for $5"
ChatGPT shows: "Saving expense..." ← invoking message
[Server processes request]
ChatGPT shows: "Saved expense" ← invoked message
[Widget updates with new data]
```

### Output Templates

Links tool output to widget rendering:

```javascript
_meta: {
  "openai/outputTemplate": "ui://widget/expense-tracker.html"
}
```

**Effect:**
- Tool returns `structuredContent`
- ChatGPT loads widget from specified URI
- Widget receives data via `window.openai.toolOutput`

---

## 🧪 Testing the Integration

### Local Development Testing

#### 1. Start Both Servers

```bash
# Terminal 1: Start MCP server
cd server && npm start
# Running on http://localhost:8787

# Terminal 2: Start React dev server
cd client && npm start
# Running on http://localhost:3000
```

#### 2. Test Standalone Mode

Open `http://localhost:3000`:
- Should fetch expenses via REST API
- Add expense → POST to /expenses
- Check Network tab for API calls

#### 3. Simulate ChatGPT Environment

In browser console:

```javascript
// Inject mock OpenAI object
window.openai = {
  toolOutput: {
    expenses: [
      { id: "1", name: "Test", amount: 10 }
    ]
  },
  callTool: async (name, args) => {
    console.log(`Tool called: ${name}`, args);
    
    // Simulate API call to MCP server
    const response = await fetch('http://localhost:8787/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name, arguments: args }
      })
    });
    
    const result = await response.json();
    return result.result;
  }
};

// Trigger global update event
const event = new CustomEvent('openai:set_globals', {
  detail: {
    globals: {
      toolOutput: {
        expenses: [
          { id: "1", name: "Test", amount: 10 },
          { id: "2", name: "New", amount: 20 }
        ]
      }
    }
  }
});
window.dispatchEvent(event);

// Reload page to test environment detection
location.reload();
```

#### 4. Test MCP Endpoint Directly

```bash
# List tools
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'

# Call list_expenses
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "list_expenses",
      "arguments": {}
    }
  }'

# Call add_expense
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "add_expense",
      "arguments": {
        "name": "Coffee",
        "amount": 5.50
      }
    }
  }'
```

### Production Testing with ChatGPT

After deploying to Vercel:

1. **Configure MCP Server in ChatGPT**
   - Settings → Integrations → Add MCP Server
   - URL: `https://your-app.vercel.app/mcp`

2. **Test Natural Language**
   ```
   "Show me my expenses"
   "Add lunch for $12"
   "Add coffee $5"
   ```

3. **Verify Widget Rendering**
   - Widget should appear after tool execution
   - Data should persist across conversation
   - Direct widget interaction should work

---

## 📝 Project Structure Summary

```
chatgpt-expense-tracker/
├── client/                    # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── api.js           # REST API client
│   │   ├── openaiBridge.js  # ChatGPT integration
│   │   └── App.jsx          # Main component
│   ├── scripts/
│   │   └── embed-react-widget.mjs  # Widget builder
│   └── build/               # Production build output
│
├── server/                   # MCP server
│   ├── server.js           # Main server file
│   ├── expenses.json       # Data storage
│   └── expense-widget.html # Embedded widget
│
├── package.json            # Root scripts
├── vercel.json            # Deployment config
└── README.md              # Documentation
```

---

## 🎯 Learning Outcomes

### What This Project Demonstrates

#### MCP & OpenAI App SDK Integration
1. **Model Context Protocol Implementation** - Building MCP servers with official SDK
2. **OpenAI App SDK Usage** - Leveraging `window.openai` for ChatGPT integration
3. **Resource Registration** - Serving widgets as MCP resources
4. **Tool Definition** - Creating callable tools with input schemas
5. **Structured Responses** - Returning data for widget rendering

#### Frontend Integration Patterns
6. **Environment Detection** - Runtime detection of ChatGPT vs standalone
7. **Dual-Mode Architecture** - Single codebase, multiple backends
8. **Event-Driven Updates** - Subscribing to ChatGPT's global state
9. **Bridge Pattern** - Abstraction layer for OpenAI SDK
10. **Conditional Rendering** - Smart component behavior based on context

#### Build & Deployment
11. **Widget Bundling** - Creating self-contained HTML from React builds
12. **Asset Inlining** - Embedding CSS/JS for zero-dependency widgets
13. **HTTP Transport** - MCP over HTTP with SSE support
14. **Session Management** - Handling stateful MCP connections

#### Modern Development Practices
15. **React Hooks** - Functional components with effects and state
16. **ESM Modules** - Modern JavaScript module system
17. **JSON-RPC Protocol** - Understanding RPC communication
18. **Event-Driven Architecture** - Custom events for state sync

---

## 🎓 Apps SDK Best Practices

### Widget Development Guidelines

#### 1. Keep Widget State Lean
```typescript
// ✅ GOOD - Small, focused state
await window.openai.setWidgetState({
  filter: "monthly",
  page: 1
});

// ❌ BAD - Large, redundant data
await window.openai.setWidgetState({
  allExpenses: [...1000 items...],  // Already in toolOutput
  cachedResults: {...},              // Redundant
  fullUserProfile: {...}             // Too much context
});
```
**Rule:** Keep widget state under 4K tokens for performance.

#### 2. Design Idempotent Tools
```typescript
// ✅ GOOD - Safe to call multiple times
server.registerTool("get_expenses", {
  annotations: { readOnlyHint: true }
}, async () => {
  return { structuredContent: { expenses: await fetchExpenses() } };
});

// ⚠️ REQUIRES CONFIRMATION - Destructive operation
server.registerTool("delete_all_expenses", {
  annotations: { destructiveHint: true }
}, async () => {
  // ChatGPT will ask "Are you sure?" before calling
  await deleteAllExpenses();
});
```

#### 3. Optimize Tool Discovery
```typescript
// ✅ GOOD - Clear, action-oriented description
{
  title: "Add Expense",
  description: "Creates a new expense entry with name and amount. Use this when the user wants to record a purchase or expenditure."
}

// ❌ BAD - Vague description
{
  title: "add",
  description: "Adds stuff to the database"
}
```

#### 4. Structure Tool Responses
```typescript
// ✅ GOOD - Separates concerns
return {
  content: [{
    type: "text",
    text: "Added coffee for $5.50"  // Human-readable summary
  }],
  structuredContent: {
    expenses: [...],                 // For model reasoning
    total: 45.50
  },
  _meta: {
    debugInfo: {...},                // Widget-only details
    timestamp: Date.now()
  }
};
```

#### 5. Handle Tool Errors Gracefully
```typescript
server.registerTool("add_expense", {
  inputSchema: { /* ... */ }
}, async (args) => {
  try {
    const expense = await saveExpense(args);
    return { structuredContent: { expense } };
  } catch (error) {
    // Return error, don't throw
    return {
      content: [{ 
        type: "text", 
        text: `Failed to add expense: ${error.message}` 
      }],
      isError: true
    };
  }
});
```

#### 6. Use React Hooks for `window.openai`
```typescript
// ✅ GOOD - Testable, reactive
function useToolOutput<T>(): T | null {
  return useSyncExternalStore(
    (onChange) => {
      const handler = (e: SetGlobalsEvent) => {
        if (e.detail.globals.toolOutput !== undefined) {
          onChange();
        }
      };
      window.addEventListener("openai:set_globals", handler);
      return () => window.removeEventListener("openai:set_globals", handler);
    },
    () => window.openai.toolOutput as T
  );
}

// Usage
function ExpenseList() {
  const toolOutput = useToolOutput<{ expenses: Expense[] }>();
  return <ul>{toolOutput?.expenses.map(...)}</ul>;
}
```

#### 7. Bundle Assets Efficiently
```typescript
// ✅ GOOD - Single file, inlined assets
// Build script creates: widget.html with embedded CSS/JS

// ❌ BAD - External dependencies
<script src="https://cdn.example.com/react.js"></script>
<link rel="stylesheet" href="/styles.css">
// These will be blocked by CSP
```

#### 8. Declare CSP Domains
```typescript
_meta: {
  "openai/widgetCSP": {
    connect_domains: [
      "https://api.yourapp.com",       // All fetch() targets
      "https://auth.yourapp.com"
    ],
    resource_domains: [
      "https://cdn.yourapp.com"        // Images, fonts, etc.
    ]
  }
}
```

#### 9. Make Tools Widget-Accessible When Needed
```typescript
// Widget can call this tool directly
server.registerTool("refresh_data", {
  _meta: {
    "openai/widgetAccessible": true,   // Enable widget → tool calls
    "openai/visibility": "private"     // Hide from model (widget-only)
  }
}, async () => {
  return { structuredContent: { data: await fetchLatest() } };
});

// In widget
async function handleRefresh() {
  const result = await window.openai.callTool("refresh_data", {});
  setData(result.structuredContent.data);
}
```

#### 10. Provide Loading States
```typescript
_meta: {
  "openai/toolInvocation/invoking": "Calculating expenses...",
  "openai/toolInvocation/invoked": "✓ Calculation complete"
}
// ChatGPT shows these messages during tool execution
```

### Component Architecture Patterns

#### Pattern 1: Environment-Aware Data Fetching
```typescript
function App() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Priority 1: Read from window.openai if available
    if (window.openai?.toolOutput?.expenses) {
      setData(window.openai.toolOutput.expenses);
      return;
    }
    
    // Priority 2: Fetch via REST API (standalone mode)
    fetch('/api/expenses').then(r => r.json()).then(setData);
  }, []);
  
  // Subscribe to ChatGPT updates
  useEffect(() => {
    if (!window.openai) return;
    
    const handler = (e: SetGlobalsEvent) => {
      if (e.detail.globals.toolOutput?.expenses) {
        setData(e.detail.globals.toolOutput.expenses);
      }
    };
    
    window.addEventListener("openai:set_globals", handler);
    return () => window.removeEventListener("openai:set_globals", handler);
  }, []);
  
  return <ExpenseList expenses={data} />;
}
```

#### Pattern 2: Conditional Tool Calling
```typescript
async function handleSubmit(expense: Expense) {
  if (window.openai?.callTool) {
    // ChatGPT mode: Use MCP tools
    const result = await window.openai.callTool("add_expense", expense);
    return result.structuredContent;
  } else {
    // Standalone mode: Use REST API
    const response = await fetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
    return response.json();
  }
}
```

#### Pattern 3: Persistent Widget State
```typescript
function usePersistedState<T>(key: string, defaultValue: T) {
  const widgetState = useOpenAiGlobal("widgetState");
  const [value, setValue] = useState<T>(
    widgetState?.[key] ?? defaultValue
  );
  
  useEffect(() => {
    window.openai?.setWidgetState({ [key]: value });
  }, [value, key]);
  
  return [value, setValue] as const;
}

// Usage
function ExpenseFilter() {
  const [filter, setFilter] = usePersistedState("filter", "all");
  // Filter persists across reloads
}
```

---

## 🤝 Key Takeaways

### MCP + React Integration Best Practices

1. **Environment Abstraction** - Create bridge layers to isolate OpenAI SDK dependencies
2. **Progressive Enhancement** - Build for standalone first, add ChatGPT as enhancement
3. **Event-Driven Sync** - Use CustomEvents for reactive state management
4. **Single-File Widgets** - Inline all assets for ChatGPT compatibility
5. **Structured Responses** - Separate text content from widget data
6. **Metadata Annotations** - Use OpenAI-specific metadata for better UX

### Common Patterns

#### Pattern 1: Environment Detection Hook
```javascript
const useOpenAIEnvironment = () => {
  const [isOpenAI, setIsOpenAI] = useState(false);
  
  useEffect(() => {
    setIsOpenAI(Boolean(window.openai));
  }, []);
  
  return isOpenAI;
};
```

#### Pattern 2: Tool Call Wrapper
```javascript
const useExpenseTool = () => {
  return useCallback(async (toolName, args) => {
    if (!window.openai?.callTool) throw new Error("Not in OpenAI environment");
    const response = await window.openai.callTool(toolName, args);
    return response?.structuredContent;
  }, []);
};
```

#### Pattern 3: Global State Subscription
```javascript
useEffect(() => {
  if (!window.openai) return;
  
  const handleUpdate = (e) => {
    const data = e.detail?.globals?.toolOutput;
    if (data) setState(data);
  };
  
  window.addEventListener("openai:set_globals", handleUpdate);
  return () => window.removeEventListener("openai:set_globals", handleUpdate);
}, []);
```

---

## 📚 Resources & References

### Official Documentation
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk) - Complete Apps SDK guide
- [Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart) - Get started quickly
- [Build ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui) - Widget development guide
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk) - Official SDK repos
- [React Documentation](https://react.dev/) - React 19 features

### Apps SDK Concepts
- [MCP Server Concepts](https://developers.openai.com/apps-sdk/concepts/mcp-server) - Understanding MCP in Apps SDK
- [UX Principles](https://developers.openai.com/apps-sdk/concepts/ux-principles) - Design guidelines
- [UI Guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines) - Component patterns
- [State Management](https://developers.openai.com/apps-sdk/build/state-management) - Widget state patterns
- [Authentication](https://developers.openai.com/apps-sdk/build/auth) - OAuth integration

### `window.openai` API Reference

#### Core Types
```typescript
// Display modes
type DisplayMode = "pip" | "inline" | "fullscreen";

// Theme
type Theme = "light" | "dark";

// Device information
type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";
interface UserAgent {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;    // Does device support hover?
    touch: boolean;    // Is it a touch device?
  };
}

// Safe area (notches, system UI)
interface SafeArea {
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
```

#### Tool Call Response
```typescript
interface CallToolResponse {
  content?: Array<{ type: "text", text: string }>;
  structuredContent?: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}
```

### MCP Tool Descriptor Reference

| Field | Location | Type | Description |
|-------|----------|------|-------------|
| `title` | Tool descriptor | string | Human-readable tool name |
| `description` | Tool descriptor | string | What the tool does (for model) |
| `inputSchema` | Tool descriptor | JSON Schema | Parameter specification |
| `outputSchema` | Tool descriptor | JSON Schema | Return value specification (optional) |
| `annotations.readOnlyHint` | Tool descriptor | boolean | Tool doesn't modify data |
| `annotations.destructiveHint` | Tool descriptor | boolean | Tool deletes/overwrites data |
| `annotations.openWorldHint` | Tool descriptor | boolean | Tool publishes externally |
| `_meta["openai/outputTemplate"]` | Tool descriptor | string (URI) | Widget resource URI |
| `_meta["openai/widgetAccessible"]` | Tool descriptor | boolean | Allow widget → tool calls |
| `_meta["openai/visibility"]` | Tool descriptor | "public" \| "private" | Model visibility |
| `_meta["openai/toolInvocation/invoking"]` | Tool descriptor | string (≤64 chars) | Loading message |
| `_meta["openai/toolInvocation/invoked"]` | Tool descriptor | string (≤64 chars) | Completion message |

### Widget Resource Metadata

| Field | Location | Type | Description |
|-------|----------|------|-------------|
| `_meta["openai/widgetDescription"]` | Resource | string | Widget summary for model |
| `_meta["openai/widgetPrefersBorder"]` | Resource | boolean | Show border in ChatGPT |
| `_meta["openai/widgetCSP"]` | Resource | object | CSP domains |
| `_meta["openai/widgetDomain"]` | Resource | string | Custom widget origin |

### Tool Response Metadata

| Field | Location | Type | Description |
|-------|----------|------|-------------|
| `content` | Tool result | Content[] | Text for model + user |
| `structuredContent` | Tool result | object | Data for model + widget |
| `_meta` | Tool result | object | Widget-only data (hidden from model) |
| `_meta["openai/closeWidget"]` | Tool result | boolean | Hide widget after response |
| `_meta["openai/widgetSessionId"]` | Tool result | string | Unique widget instance ID |

### Client-Provided Metadata

| Field | Location | Type | Description |
|-------|----------|------|-------------|
| `_meta["openai/locale"]` | Tool calls | string (BCP 47) | User's language |
| `_meta["openai/userAgent"]` | Tool calls | string | Device/browser info |
| `_meta["openai/userLocation"]` | Tool calls | object | City, country, timezone, coords |
| `_meta["openai/subject"]` | Tool calls | string | Anonymized user ID |

### Key Concepts
- **JSON-RPC 2.0** - Remote procedure call protocol used by MCP
- **Server-Sent Events (SSE)** - HTTP streaming for real-time updates
- **Streamable HTTP** - MCP transport over standard HTTP
- **Skybridge** - OpenAI's secure iframe sandbox runtime
- **Zod Schema Validation** - Runtime type checking and validation
- **Component Templates** - HTML+CSS+JS bundles served as MCP resources

### Official Examples
- [Apps SDK Examples Repository](https://github.com/openai/openai-apps-sdk-examples) - Multiple example apps
- [Pizzaz List](https://developers.openai.com/apps-sdk/build/examples) - Card-based list UI
- [Pizzaz Map](https://developers.openai.com/apps-sdk/build/examples) - Mapbox integration
- [Pizzaz Carousel](https://developers.openai.com/apps-sdk/build/examples) - Media gallery

### Tools & Debugging
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) - Debug MCP servers locally
- [Apps SDK UI Kit](https://openai.github.io/apps-sdk-ui) - Ready-made React components
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer) - Count tokens for widget state

### Related Projects
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers) - Community MCP servers
- [Python SDK (FastMCP)](https://github.com/modelcontextprotocol/python-sdk) - Python implementation
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - TypeScript implementation

---

## 🏁 Conclusion

This project showcases a **complete integration** between MCP servers and React frontends for ChatGPT using the official **OpenAI Apps SDK**. It demonstrates:

✅ **Dual-mode operation** - Works standalone and in ChatGPT  
✅ **MCP Protocol** - Resources, tools, structured responses via JSON-RPC  
✅ **OpenAI Apps SDK** - `window.openai` bridge, Skybridge runtime, state management  
✅ **Widget bundling** - Single-file HTML generation for CSP compliance  
✅ **Real-time sync** - Event-driven state management via `openai:set_globals`  
✅ **Production-ready** - Deployment strategies and testing workflows  

### Perfect For
- Learning MCP + ChatGPT Apps SDK integration
- Building AI-native web applications
- Understanding modern React patterns with AI context
- Creating embeddable ChatGPT widgets
- Exploring dual-environment architectures

### Architecture Advantages
- **Flexible** - Same code for web and ChatGPT environments
- **Standards-Based** - Built on open MCP protocol
- **Maintainable** - Clear separation of concerns (MCP server, widget, bridge)
- **Scalable** - Easy to add new tools and UI components
- **Testable** - Can test both modes independently
- **Future-Proof** - Uses official OpenAI SDK patterns

### Apps SDK Features Demonstrated

| Feature | Implementation |
|---------|---------------|
| MCP Tools | `list_expenses`, `add_expense` with Zod validation |
| Widget Resources | Single-file HTML with inlined React bundle |
| Tool Metadata | `_meta` annotations for invoking/invoked messages |
| Structured Content | Separate data for model vs widget |
| Event Listening | `openai:set_globals` subscriptions |
| Tool Calling | `window.openai.callTool()` from widget |
| State Management | Read from `toolOutput`, persist via `setWidgetState` |
| Environment Detection | Runtime check for `window.openai` |
| Display Modes | Inline widget rendering (extensible to PiP/fullscreen) |
| Localization Ready | Can read `window.openai.locale` |
| Theme Aware | Can read `window.openai.theme` |

---

## 👥 Questions & Discussion

**Get Involved:**
- 🌟 Star the repository
- 🐛 Report issues
- 💡 Suggest features
- 🤝 Submit pull requests

**Topics for Deeper Exploration:**
- Implementing authentication in ChatGPT widgets
- Real-time multi-user synchronization
- Advanced MCP features (streaming, progress)
- TypeScript migration strategies
- Testing strategies for dual-mode apps

**Contact:**
- GitHub: bashirkarimi/chatgpt-expense-tracker
- Issues: [Create an issue](https://github.com/bashirkarimi/chatgpt-expense-tracker/issues)

---

### Thank You! 🙏

**Ready to build your own MCP-powered applications?**

This project provides a solid foundation for integrating React applications with ChatGPT through the Model Context Protocol. Use it as a template to create amazing AI-powered experiences!

**Key Files to Study:**
- `client/src/openaiBridge.js` - OpenAI SDK integration
- `server/server.js` - MCP server implementation
- `client/src/App.jsx` - Environment-aware React component
- `client/scripts/embed-react-widget.mjs` - Widget bundling
