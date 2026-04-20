// Budgets page: displays all budgets with spending progress and allows creating, editing, and deleting them.
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppTitle from '../components/AppTitle';

interface Budget {
  id: string;
  categoryId: string;
  limitAmount: string;
  period: string;
  startDate: string | null;
  endDate: string | null;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function BudgetsPage() {
  const { token } = useAuth();

  // data state
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // form state
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [editPeriod, setEditPeriod] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [budgetRes, catRes] = await Promise.all([
          fetch('http://localhost:5000/api/budgets', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [budgetData, catData] = await Promise.all([
          budgetRes.json(),
          catRes.json(),
        ]);
        setBudgets(budgetData);
        setCategories(catData);
        if (catData.length > 0) setCategoryId(catData[0].id);
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
      const res = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId,
          limitAmount: parseFloat(limitAmount),
          period,
          startDate: period === 'custom' ? startDate || null : null,
          endDate: period === 'custom' ? endDate || null : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create budget');
        return;
      }

      const updatedRes = await fetch('http://localhost:5000/api/budgets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setBudgets(updatedData);
      setLimitAmount('');
      setStartDate('');
      setEndDate('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(budgets.filter((b) => b.id !== id));
    } catch {
      console.error('Failed to delete budget');
    }
  }

  async function handleUpdate(id: string) {
    try {
      await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          limitAmount: parseFloat(editLimit),
          period: editPeriod,
          startDate: editPeriod === 'custom' ? editStartDate || null : null,
          endDate: editPeriod === 'custom' ? editEndDate || null : null,
        }),
      });
      setBudgets(
        budgets.map((b) =>
          b.id === id
            ? { ...b, limitAmount: editLimit, period: editPeriod, startDate: editStartDate, endDate: editEndDate }
            : b
        )
      );
      setEditingId(null);
    } catch {
      console.error('Failed to update budget');
    }
  }

  return (
    
      <div style={styles.container}>
        <AppTitle/>
        <h2 style={styles.heading}>My Budgets</h2>

        <div style={styles.list}>
          {budgets.length === 0 && (
            <p style={styles.empty}>No budgets yet. Create one below!</p>
          )}
          {budgets.map((b) => (
            <div key={b.id} style={styles.card}>
              {editingId === b.id ? (
                <div style={styles.editForm}>
                  <input style={styles.input} type="number" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} placeholder="Limit amount" />
                  <select style={styles.input} value={editPeriod} onChange={(e) => setEditPeriod(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                  {editPeriod === 'custom' && (
                    <>
                      <input style={styles.input} type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                      <input style={styles.input} type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                    </>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.editButton} onClick={() => handleUpdate(b.id)}>Save</button>
                    <button style={styles.deleteButton} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <p style={styles.categoryName}>{b.category.name}</p>
                    <p style={styles.period}>{b.period}</p>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{
                      height: '100%',
                      width: '0%',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-neon-yellow)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <div style={styles.cardFooter}>
                    <p style={styles.meta}>$0 spent</p>
                    <p style={styles.limit}>Limit: ${parseFloat(b.limitAmount).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button style={styles.editButton} onClick={() => {
                      setEditingId(b.id);
                      setEditLimit(b.limitAmount);
                      setEditPeriod(b.period);
                      setEditStartDate(b.startDate ? b.startDate.split('T')[0] : '');
                      setEditEndDate(b.endDate ? b.endDate.split('T')[0] : '');
                    }}>Edit</button>
                    <button style={styles.deleteButton} onClick={() => handleDelete(b.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 style={styles.heading}>Add Budget</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleCreate} style={styles.form}>
          <select style={styles.input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input style={styles.input} type="number" placeholder="Spending limit" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} required />
          <select style={styles.input} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
          {period === 'custom' && (
            <>
              <input style={styles.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input style={styles.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </>
          )}
          <button style={styles.button} type="submit">Create Budget</button>
        </form>
      </div>
   
  );
}

const styles: Record<string, React.CSSProperties> = {

 container: {
    color: 'var(--color-text-light)',
    width: '100%',
    maxWidth: '900px',
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
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontWeight: 'bold',
    margin: 0,
    fontSize: '16px',
  },
  period: {
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    margin: 0,
    textTransform: 'capitalize',
  },
  progressBarBg: {
    backgroundColor: 'var(--color-bg-input)',
    borderRadius: 'var(--radius-pill)',
    height: '8px',
    width: '100%',
    overflow: 'hidden',
  },
  meta: {
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    margin: 0,
  },
  limit: {
    color: 'var(--color-text-light)',
    fontSize: '13px',
    margin: 0,
    fontWeight: 'bold',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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