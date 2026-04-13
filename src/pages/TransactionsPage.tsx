// Transactions page: displays all transactions and allows creating, editing, and deleting them.
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppTitle from "../components/AppTitle";

interface Transaction {
  id: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  amount: string;
  type: string;
  note: string | null;
  date: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
}

export default function TransactionsPage() {
  const { token } = useAuth();
  // transaction list, accounts, and categories data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // new transaction form state
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // filter state
  const [filterAccount, setFilterAccount] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [txRes, accRes, catRes] = await Promise.all([
          fetch("http://localhost:5000/api/transactions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/accounts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [txData, accData, catData] = await Promise.all([
          txRes.json(),
          accRes.json(),
          catRes.json(),
        ]);
        setTransactions(txData);
        setAccounts(accData);
        setCategories(catData);
        if (accData.length > 0) setAccountId(accData[0].id);
      } catch {
        console.error("Failed to fetch data");
      }
    }
    fetchData();
  }, [token]);

  async function fetchTransactions() {
    const params = new URLSearchParams();
    if (filterAccount) params.append("accountId", filterAccount);
    if (filterCategory) params.append("categoryId", filterCategory);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const res = await fetch(
        `http://localhost:5000/api/transactions?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setTransactions(data);
    } catch {
      console.error("Failed to fetch transactions");
    }
  }

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId,
          toAccountId: type === "transfer" ? toAccountId : null,
          categoryId: categoryId || null,
          amount: parseFloat(amount),
          type,
          note: note || null,
          date,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create transaction");
        return;
      }

      setTransactions([data, ...transactions]);
      setAmount("");
      setNote("");
      setDate("");
      setCategoryId("");
      setToAccountId("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch {
      console.error("Failed to delete transaction");
    }
  }

  async function handleUpdate(id: string) {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(editAmount),
          categoryId: editCategoryId || null,
          date: editDate,
          note: editNote || null,
        }),
      });
      setTransactions(
        transactions.map((t) =>
          t.id === id
            ? {
                ...t,
                amount: editAmount,
                categoryId: editCategoryId,
                date: editDate,
                note: editNote,
              }
            : t,
        ),
      );
      setEditingId(null);
    } catch {
      console.error("Failed to update transaction");
    }
  }

  function getAccountName(id: string) {
    return accounts.find((a) => a.id === id)?.name || id;
  }

  function getCategoryName(id: string | null) {
    if (!id) return "—";
    return categories.find((c) => c.id === id)?.name || id;
  }

  function getAmountColor(type: string) {
    if (type === "expense") return "var(--color-danger)";
    if (type === "income") return "var(--color-success)";
    return "var(--color-text-muted)";
  }

  return (
    <div style={styles.container}>
      <AppTitle />

      <div style={styles.content}>
        <h2 style={styles.heading}>Filter Transactions</h2>
        <div style={styles.filterRow}>
          <select
            style={styles.input}
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            style={styles.input}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            style={styles.input}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button style={styles.button} onClick={fetchTransactions}>
            Apply Filters
          </button>
        </div>

        <h2 style={styles.heading}>My Transactions</h2>
        <div style={styles.list}>
          {transactions.length === 0 && (
            <p style={styles.empty}>No transactions yet.</p>
          )}
          {transactions.map((t) => (
            <div key={t.id} style={styles.card}>
              {editingId === t.id ? (
                <div style={styles.editForm}>
                  <input
                    style={styles.input}
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Amount"
                  />
                  <select
                    style={styles.input}
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    style={styles.input}
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                  <input
                    style={styles.input}
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Note"
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={styles.editButton}
                      onClick={() => handleUpdate(t.id)}
                    >
                      Save
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.cardRow}>
                  <div>
                    <p
                      style={{
                        color: getAmountColor(t.type),
                        fontWeight: "bold",
                        fontSize: "18px",
                        margin: 0,
                      }}
                    >
                      {t.type === "expense" ? "-" : "+"}$
                      {parseFloat(t.amount).toFixed(2)}
                    </p>
                    <p style={styles.txMeta}>
                      {t.type} · {getAccountName(t.accountId)} ·{" "}
                      {getCategoryName(t.categoryId)}
                    </p>
                    <p style={styles.txMeta}>
                      {new Date(t.date).toLocaleDateString()}{" "}
                      {t.note && `· ${t.note}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={styles.editButton}
                      onClick={() => {
                        setEditingId(t.id);
                        setEditAmount(t.amount);
                        setEditCategoryId(t.categoryId || "");
                        setEditDate(t.date.split("T")[0]);
                        setEditNote(t.note || "");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 style={styles.heading}>Add Transaction</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleCreate} style={styles.form}>
          <select
            style={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
          <input
            style={styles.input}
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select
            style={styles.input}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {type === "transfer" && (
            <select
              style={styles.input}
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              <option value="">Transfer to account</option>
              {accounts
                .filter((a) => a.id !== accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          )}
          {type !== "transfer" && (
            <select
              style={styles.input}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <input
            style={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button style={styles.button} type="submit">
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "var(--color-bg-page)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "40px",
    gap: "24px",
  },
  content: {
    width: "100%",
    maxWidth: "700px",
    padding: "0 24px",
  },
  heading: {
    color: "var(--color-text-light)",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
    marginTop: "32px",
  },
  filterRow: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "var(--color-bg-card)",
    border: "var(--border-chunky-light)",
    borderRadius: "var(--radius-md)",
    padding: "16px 20px",
    boxShadow: "var(--shadow-card)",
  },
  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  txMeta: {
    color: "var(--color-text-muted)",
    fontSize: "13px",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    backgroundColor: "var(--color-bg-input)",
    border: "var(--border-chunky-light)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    color: "var(--color-text-light)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font-sans)",
    width: "100%",
  },
  button: {
    backgroundColor: "var(--color-accent)",
    color: "var(--color-text-primary)",
    border: "var(--border-chunky)",
    borderRadius: "var(--radius-sm)",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "var(--shadow-btn)",
    fontFamily: "var(--font-sans)",
    width: "100%",
  },
  editButton: {
    backgroundColor: "transparent",
    border: "var(--border-chunky-light)",
    borderRadius: "var(--radius-sm)",
    color: "var(--color-text-light)",
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "2.5px solid var(--color-danger)",
    borderRadius: "var(--radius-sm)",
    color: "var(--color-danger)",
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
  },
  empty: {
    color: "var(--color-text-muted)",
    fontSize: "14px",
  },
  error: {
    color: "var(--color-danger)",
    fontSize: "14px",
    marginBottom: "12px",
  },
};
