// src/api.js
const API_URL = process.env.REACT_APP_API_URL || window.location.origin || "http://localhost:8787";

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
