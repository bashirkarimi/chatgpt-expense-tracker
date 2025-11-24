import { useEffect, useState } from "react";
import { addExpense, getExpenses } from "./api";
import ExpenseForm from "./components/expense-form";
import ExpenseList from "./components/expense-list";
import {
  callExpenseTool,
  isOpenAIEnvironment,
  readExpensesFromOpenAI,
  subscribeToOpenAIGlobals,
} from "./openaiBridge";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const openaiExpenses = readExpensesFromOpenAI();
    if (openaiExpenses) {
      setExpenses(openaiExpenses);
      return;
    }

    if (isOpenAIEnvironment()) {
      callExpenseTool("list_expenses", {}).then((updated) => {
        if (updated) setExpenses(updated);
      });
      return;
    }

    getExpenses().then(setExpenses);
  }, []);

  useEffect(() => {
    if (!isOpenAIEnvironment()) return undefined;
    return subscribeToOpenAIGlobals((nextExpenses) => setExpenses(nextExpenses));
  }, []);

  const handleAdd = async (expense) => {
    const normalized = {
      name: expense.name.trim(),
      amount: Number(expense.amount),
    };

    if (!normalized.name || Number.isNaN(normalized.amount)) return;

    if (isOpenAIEnvironment()) {
      const updatedExpenses = await callExpenseTool("add_expense", normalized);
      if (updatedExpenses) {
        setExpenses(updatedExpenses);
      }
      return;
    }

    const saved = await addExpense(normalized);
    setExpenses((prev) => [...prev, saved]);
  };

  return (
    <div className="App">
      <h2>💰 Expense Tracker</h2>
      <ExpenseForm onAdd={handleAdd} />
      <ExpenseList expenses={expenses} />
    </div>
  );
}

export default App;
