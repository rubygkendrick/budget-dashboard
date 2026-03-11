// src/components/TransactionForm.tsx

import { useState } from "react";
//this declares the transaction object and defines the fields
//type alias : lets you enforce the shape of data
type Transaction = {
  amount: string;
  description: string;
  category: string;
  date: string;
};
//this defines the categories objects and the fields....
const CATEGORIES = [
  "Groceries",
  "Rent",
  "Entertainment",
  "Transport",
  "Utilities",
  "Other",
];

export default function TransactionForm() {
  const [form, setForm] = useState<Transaction>({
    amount: "",
    description: "",
    category: "",
    date: "",
  });

  function handleChange(
    //"e is a change event, triggered by either an input field or a select dropdown" (typescript)
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    console.log("Transaction submitted:", form);
    // later this is where you'd call your Node/Express API:
    // await fetch("/api/transactions", { method: "POST", body: form })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="amount"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
      />
      <input
        name="description"
        type="text"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <select name="category" value={form.category} onChange={handleChange}>
        <option value="">Select a category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
      />
      <button type="submit">Add Transaction</button>
    </form>
  );
}
