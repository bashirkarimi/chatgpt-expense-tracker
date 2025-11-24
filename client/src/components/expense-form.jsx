import { useState } from "react";

export default function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({ name: "", amount: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    onAdd(form);
    setForm({ name: "", amount: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <input
        type="text"
        placeholder="Item"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <button type="submit">Add</button>
    </form>
  );
}
