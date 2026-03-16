// src/components/TransactionForm.tsx

import { useState } from "react";
import "./TransactionForm.css";
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

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function handleChange(
    //"e is a change event, triggered by either an input field or a select dropdown" (typescript)
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setTransactions([form, ...transactions]);
    setForm({ amount: "", description: "", category: "", date: "" });
    console.log("Transaction submitted:", form);
    // later this is where you'd call your Node/Express API:
    // await fetch("/api/transactions", { method: "POST", body: form })

  }

  return (
    <div className="transaction-page">
    <div className="transaction-card">
  
      <div className="transaction-header">
        <h1 className="transaction-header__title">New Transaction</h1>
        <p className="transaction-header__subtitle">Record a new expense or payment</p>
      </div>
  
      <form className="transaction-form" onSubmit={handleSubmit}>
  
        <div className="form-field">
          <label className="form-field__label">Amount</label>
          <input
            className="form-field__input form-field__input--amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
          />
        </div>
  
        <div className="form-field">
          <label className="form-field__label">Description</label>
          <input
            className="form-field__input"
            name="description"
            type="text"
            placeholder="What was this for?"
            value={form.description}
            onChange={handleChange}
          />
        </div>
  
        <div className="form-field">
          <label className="form-field__label">Category</label>
          <select
            className="form-field__input form-field__select"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
  
        <div className="form-field">
          <label className="form-field__label">Date</label>
          <input
            className="form-field__input"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>
  
        <div className="transaction-divider" />
  
        <button className="transaction-btn" type="submit">
          Add Transaction
        </button>
  
      </form>
    </div>
         {/* 3. Transaction list — only renders once there's at least one entry */}
         {transactions.length > 0 && ( 
        <div className="transaction-list">
          <h2 className="transaction-list__title">Transactions</h2>

          {/* Header row */}
          <div className="transaction-list__row transaction-list__row--header">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Amount</span>
          </div>

          {/* Data rows */}
          {transactions.map((t, i) => (
            <div key={i} className="transaction-list__row">
              <span>{t.date}</span>
              <span>{t.description}</span>
              <span>{t.category}</span>
              <span>${parseFloat(t.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
  </div>
  );
}
