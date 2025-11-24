// src/api.js
const API_URL = "http://localhost:8787"; // MCP server also exposes REST fallback here

export async function getExpenses() {
  const res = await fetch(`${API_URL}/expenses`);
  return res.json();
}

export async function addExpense(expense) {
  const res = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
}
