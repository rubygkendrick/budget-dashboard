// Recurring page: displays all recurring templates and allows creating, editing, deactivating, and deleting them.
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface RecurringTemplate {
  id: string;
  name: string;
  amount: string;
  type: string;
  accountId: string;
  categoryId: string | null;
  frequency: string;
  nextDue: string | null;
  isActive: boolean;
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function RecurringPage() {
  const { token } = useAuth();

  // data state
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDue, setNextDue] = useState('');
  const [error, setError] = useState('');

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [editNextDue, setEditNextDue] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [tmplRes, accRes, catRes] = await Promise.all([
          fetch('http://localhost:5000/api/recurring', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/accounts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [tmplData, accData, catData] = await Promise.all([
          tmplRes.json(),
          accRes.json(),
          catRes.json(),
        ]);
        setTemplates(tmplData);
        setAccounts(accData);
        setCategories(catData);
        if (accData.length > 0) setAccountId(accData[0].id);
      } catch {
        console.error('Failed to fetch data');
      }
    }
    fetchData();
  }, [token]);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          type,
          accountId,
          categoryId: categoryId || null,
          frequency,
          nextDue: nextDue || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create template');
        return;
      }

      setTemplates([...templates, data]);
      setName('');
      setAmount('');
      setCategoryId('');
      setNextDue('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`http://localhost:5000/api/recurring/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(templates.filter((t) => t.id !== id));
    } catch {
      console.error('Failed to delete template');
    }
  }

  async function handleUpdate(id: string) {
    try {
      await fetch(`http://localhost:5000/api/recurring/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          amount: parseFloat(editAmount),
          frequency: editFrequency,
          nextDue: editNextDue || null,
        }),
      });
      setTemplates(
        templates.map((t) =>
          t.id === id
            ? { ...t, name: editName, amount: editAmount, frequency: editFrequency, nextDue: editNextDue }
            : t
        )
      );
      setEditingId(null);
    } catch {
      console.error('Failed to update template');
    }
  }

  async function handleToggleActive(template: RecurringTemplate) {
    try {
      await fetch(`http://localhost:5000/api/recurring/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...template, isActive: !template.isActive }),
      });
      setTemplates(
        templates.map((t) =>
          t.id === template.id ? { ...t, isActive: !t.isActive } : t
        )
      );
    } catch {
      console.error('Failed to toggle template');
    }
  }

  function getAccountName(id: string) {
    return accounts.find((a) => a.id === id)?.name || id;
  }

  function getCategoryName(id: string | null) {
    if (!id) return '—';
    return categories.find((c) => c.id === id)?.name || id;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Recurring Templates</h2>

      <div style={styles.list}>
        {templates.length === 0 && (
          <p style={styles.empty}>No recurring templates yet. Create one below!</p>
        )}
        {templates.map((t) => (
          <div key={t.id} style={{ ...styles.card, opacity: t.isActive ? 1 : 0.5 }}>
            {editingId === t.id ? (
              <div style={styles.editForm}>
                <input style={styles.input} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                <input style={styles.input} type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="Amount" />
                <select style={styles.input} value={editFrequency} onChange={(e) => setEditFrequency(e.target.value)}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input style={styles.input} type="date" value={editNextDue} onChange={(e) => setEditNextDue(e.target.value)} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={styles.editButton} onClick={() => handleUpdate(t.id)}>Save</button>
                  <button style={styles.deleteButton} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={styles.cardRow}>
                <div>
                  <p style={styles.templateName}>{t.name} {!t.isActive && <span style={styles.inactiveBadge}>Inactive</span>}</p>
                  <p style={styles.meta}>{t.frequency} · {getAccountName(t.accountId)} · {getCategoryName(t.categoryId)}</p>
                  {t.nextDue && <p style={styles.meta}>Due: {new Date(t.nextDue).toLocaleDateString()}</p>}
                </div>
                <div style={styles.actions}>
                  <p style={styles.amount}>${parseFloat(t.amount).toFixed(2)}</p>
                  <button style={styles.editButton} onClick={() => {
                    setEditingId(t.id);
                    setEditName(t.name);
                    setEditAmount(t.amount);
                    setEditFrequency(t.frequency);
                    setEditNextDue(t.nextDue ? t.nextDue.split('T')[0] : '');
                  }}>Edit</button>
                  <button style={styles.editButton} onClick={() => handleToggleActive(t)}>
                    {t.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(t.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 style={styles.heading}>Add Template</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleCreate} style={styles.form}>
        <input style={styles.input} type="text" placeholder="Name (e.g. Netflix)" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={styles.input} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select style={styles.input} value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          <option value="">Select account</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select style={styles.input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={styles.input} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input style={styles.input} type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
        <button style={styles.button} type="submit">Create Template</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    color: 'var(--color-text-light)',
    maxWidth: '700px',
  },
  heading: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    marginTop: '32px',
    color: 'var(--color-text-light)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: 'var(--color-bg-card)',
    border: 'var(--border-chunky-light)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
    boxShadow: 'var(--shadow-card)',
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  templateName: {
    fontWeight: 'bold',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inactiveBadge: {
    backgroundColor: 'var(--color-bg-input)',
    color: 'var(--color-text-muted)',
    borderRadius: 'var(--radius-pill)',
    padding: '2px 8px',
    fontSize: '11px',
  },
  meta: {
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    margin: 0,
    marginTop: '4px',
  },
  amount: {
    color: 'var(--color-neon-green)',
    fontWeight: 'bold',
    fontSize: '16px',
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '700px',
  },
  input: {
    backgroundColor: 'var(--color-bg-input)',
    border: 'var(--border-chunky-light)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    color: 'var(--color-text-light)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    width: '100%',
  },
  button: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-primary)',
    border: 'var(--border-chunky)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: 'var(--shadow-btn)',
    fontFamily: 'var(--font-sans)',
    width: '100%',
  },
  editButton: {
    backgroundColor: 'transparent',
    border: 'var(--border-chunky-light)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-light)',
    padding: '4px 10px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: '2.5px solid var(--color-danger)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-danger)',
    padding: '4px 10px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
  },
  empty: {
    color: 'var(--color-text-muted)',
    fontSize: '14px',
  },
  error: {
    color: 'var(--color-danger)',
    fontSize: '14px',
    marginBottom: '12px',
  },
};