# ChatGPT Expense Tracker

An MCP (Model Context Protocol) expense tracker application that integrates with ChatGPT as an app widget.

## Features

- Add and list expenses through a React UI
- MCP server for ChatGPT integration
- Embedded widget for ChatGPT apps
- REST API fallback

## Project Structure

```
├── client/          # React frontend
├── server/          # MCP server with REST API
└── package.json     # Root build scripts
```

## Local Development

### Prerequisites

- Node.js 18+ 
- npm

### Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Start the server (Terminal 1):
```bash
npm run dev:server
```

3. Start the client (Terminal 2):
```bash
npm run dev:client
```

The client will run on `http://localhost:3000` and the server on `http://localhost:8787`.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts. The build will automatically:
   - Build the React app
   - Generate the embedded widget HTML
   - Deploy the MCP server as a serverless function

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/new)
3. Vercel will automatically detect the configuration from `vercel.json`
4. Click "Deploy"

### Environment Variables (Optional)

If you need to customize the API URL, set in Vercel:

- `REACT_APP_API_URL`: API endpoint (leave empty to use same domain)

## Architecture

### Client

React app that:
- Displays expense list
- Allows adding new expenses
- Works standalone or as ChatGPT widget via `openaiBridge.js`

### Server

Node.js MCP server that:
- Implements Model Context Protocol for ChatGPT
- Exposes REST API endpoints (`/expenses`)
- Serves the embedded widget HTML at `/mcp` for ChatGPT integration
- Stores expenses in `expenses.json`

### Widget Generation

The `embed-react-widget.mjs` script:
- Reads the React build
- Inlines all CSS and JS
- Generates a single-file HTML widget
- Saves to `server/expense-widget.html` for MCP resource serving

## API Endpoints

- `GET /expenses` - List all expenses
- `POST /expenses` - Add a new expense
- `POST /mcp` - MCP protocol endpoint for ChatGPT

## MCP Integration

The server registers:
- **Resource**: `ui://widget/expense-tracker.html` - The embedded widget
- **Tools**: 
  - `list_expenses` - Returns all expenses
  - `add_expense` - Adds a new expense

## Notes

- The widget is regenerated on each build
- Expenses are stored in a JSON file (consider a database for production)
- CORS is enabled for development (restrict in production)

## License

ISC
