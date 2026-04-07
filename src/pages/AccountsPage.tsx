// Accounts page: displays all user accounts and allows creating new ones.
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppTitle from "../components/AppTitle";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
}

export default function AccountsPage() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("http://localhost:5000/api/accounts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAccounts();
  }, [token]);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type, balance: parseFloat(balance) || 0 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      setAccounts([...accounts, data]);
      setName("");
      setBalance("");
      setType("checking");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`http://localhost:5000/api/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(accounts.filter((account) => account.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdate(id: string, name: string, type: string) {
    try {
      await fetch(`http://localhost:5000/api/accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type }),
      });
      setAccounts(
        accounts.map((account) =>
          account.id === id ? { ...account, name, type } : account,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={styles.container}>
      <AppTitle />

      <div style={styles.content}>
        <h2 style={styles.heading}>My Accounts</h2>

        <div style={styles.accountsList}>
          {accounts.length === 0 && (
            <p style={styles.empty}>No accounts yet. Create one below!</p>
          )}
          {accounts.map((account) => (
            <div key={account.id} style={styles.card}>
              {editingId === account.id ? (
                <>
                  <input
                    style={{ ...styles.input, marginBottom: "8px" }}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <select
                    style={styles.input}
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit</option>
                    <option value="cash">Cash</option>
                  </select>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                  >
                    <button
                      style={styles.button}
                      onClick={() => {
                        handleUpdate(account.id, editName, editType);
                        setEditingId(null);
                      }}
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
                </>
              ) : (
                <>
                  <div>
                    <p style={styles.accountName}>{account.name}</p>
                    <p style={styles.accountType}>{account.type}</p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <p style={styles.balance}>
                      ${parseFloat(account.balance).toFixed(2)}
                    </p>
                    <button
                      style={styles.editButton}
                      onClick={() => {
                        setEditingId(account.id);
                        setEditName(account.name);
                        setEditType(account.type);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(account.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <h2 style={styles.heading}>Add Account</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleCreate} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Account name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            style={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit</option>
            <option value="cash">Cash</option>
          </select>
          <input
            style={styles.input}
            type="number"
            placeholder="Starting balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <button style={styles.button} type="submit">
            Create Account
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
    maxWidth: "600px",
    padding: "0 24px",
  },
  heading: {
    color: "var(--color-text-light)",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  accountsList: {
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "var(--shadow-card)",
    flexWrap: "wrap",
    gap: "8px",
  },
  accountName: {
    color: "var(--color-text-light)",
    fontWeight: "bold",
    margin: 0,
  },
  accountType: {
    color: "var(--color-text-muted)",
    fontSize: "13px",
    margin: 0,
    textTransform: "capitalize",
  },
  balance: {
    color: "var(--color-neon-green)",
    fontWeight: "bold",
    fontSize: "18px",
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
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "13px",
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "2.5px solid var(--color-danger)",
    borderRadius: "var(--radius-sm)",
    color: "var(--color-danger)",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "13px",
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
