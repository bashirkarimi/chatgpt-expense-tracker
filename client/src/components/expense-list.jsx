export default function ExpenseList({ expenses }) {
  const formatAmount = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue.toFixed(2) : value;
  };

  if (expenses.length === 0) return <p>No expenses yet.</p>;

  return (
    <ul className="expense-list">
      {expenses.map((exp) => (
        <li key={exp.id}>
          <span><strong>{exp.name}</strong> </span><span> ${formatAmount(exp.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
