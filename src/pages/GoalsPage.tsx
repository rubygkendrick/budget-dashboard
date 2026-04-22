// Goals page: displays all savings goals with progress and allows creating, editing, marking achieved, and deleting.
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppTitle from '../components/AppTitle';

interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string | null;
  isAchieved: boolean;
  accountId: string | null;
}

interface Account {
  id: string;
  name: string;
}

export default function GoalsPage() {
  const { token } = useAuth();

  // data state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editCurrentAmount, setEditCurrentAmount] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes, accRes] = await Promise.all([
          fetch('http://localhost:5000/api/goals', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/accounts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [goalsData, accData] = await Promise.all([
          goalsRes.json(),
          accRes.json(),
        ]);
        setGoals(goalsData);
        setAccounts(accData);
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
      const res = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          targetAmount: parseFloat(targetAmount),
          accountId: accountId || null,
          targetDate: targetDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create goal');
        return;
      }

      setGoals([...goals, data]);
      setName('');
      setTargetAmount('');
      setAccountId('');
      setTargetDate('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(goals.filter((g) => g.id !== id));
    } catch {
      console.error('Failed to delete goal');
    }
  }

  async function handleUpdate(id: string) {
    try {
      await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          targetAmount: parseFloat(editTargetAmount),
          currentAmount: parseFloat(editCurrentAmount),
          targetDate: editTargetDate || null,
        }),
      });
      setGoals(
        goals.map((g) =>
          g.id === id
            ? { ...g, name: editName, targetAmount: editTargetAmount, currentAmount: editCurrentAmount, targetDate: editTargetDate }
            : g
        )
      );
      setEditingId(null);
    } catch {
      console.error('Failed to update goal');
    }
  }

  async function handleToggleAchieved(goal: Goal) {
    try {
      await fetch(`http://localhost:5000/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...goal, isAchieved: !goal.isAchieved }),
      });
      setGoals(
        goals.map((g) =>
          g.id === goal.id ? { ...g, isAchieved: !g.isAchieved } : g
        )
      );
    } catch {
      console.error('Failed to toggle goal');
    }
  }

  function getProgress(current: string, target: string) {
    const pct = (parseFloat(current) / parseFloat(target)) * 100;
    return Math.min(pct, 100);
  }

  function getProgressColor(pct: number) {
    if (pct >= 100) return 'var(--color-neon-green)';
    if (pct >= 50) return 'var(--color-neon-yellow)';
    return 'var(--color-neon-pink)';
  }

  function getAccountName(id: string | null) {
    if (!id) return null;
    return accounts.find((a) => a.id === id)?.name || null;
  }

  return (
    <div style={styles.container}>
      <AppTitle />

      <h2 style={styles.heading}>My Goals</h2>

      <div style={styles.list}>
        {goals.length === 0 && (
          <p style={styles.empty}>No goals yet. Create one below!</p>
        )}
        {goals.map((g) => {
          const pct = getProgress(g.currentAmount, g.targetAmount);
          const color = getProgressColor(pct);
          return (
            <div key={g.id} style={{ ...styles.card, opacity: g.isAchieved ? 0.7 : 1 }}>
              {editingId === g.id ? (
                <div style={styles.editForm}>
                  <input style={styles.input} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Goal name" />
                  <input style={styles.input} type="number" value={editTargetAmount} onChange={(e) => setEditTargetAmount(e.target.value)} placeholder="Target amount" />
                  <input style={styles.input} type="number" value={editCurrentAmount} onChange={(e) => setEditCurrentAmount(e.target.value)} placeholder="Current amount" />
                  <input style={styles.input} type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.editButton} onClick={() => handleUpdate(g.id)}>Save</button>
                    <button style={styles.deleteButton} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <div>
                      <p style={styles.goalName}>
                        {g.name}
                        {g.isAchieved && <span style={styles.achievedBadge}>✓ Achieved</span>}
                      </p>
                      {getAccountName(g.accountId) && (
                        <p style={styles.meta}>Linked to: {getAccountName(g.accountId)}</p>
                      )}
                      {g.targetDate && (
                        <p style={styles.meta}>Target date: {new Date(g.targetDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <p style={styles.amounts}>
                      ${parseFloat(g.currentAmount).toFixed(2)} / ${parseFloat(g.targetAmount).toFixed(2)}
                    </p>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: color,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <p style={{ ...styles.meta, textAlign: 'right' }}>{Math.round(pct)}%</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button style={styles.editButton} onClick={() => {
                      setEditingId(g.id);
                      setEditName(g.name);
                      setEditTargetAmount(g.targetAmount);
                      setEditCurrentAmount(g.currentAmount);
                      setEditTargetDate(g.targetDate ? g.targetDate.split('T')[0] : '');
                    }}>Edit</button>
                    <button style={styles.editButton} onClick={() => handleToggleAchieved(g)}>
                      {g.isAchieved ? 'Unmark' : 'Mark Achieved'}
                    </button>
                    <button style={styles.deleteButton} onClick={() => handleDelete(g.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 style={styles.heading}>Add Goal</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleCreate} style={styles.form}>
        <input style={styles.input} type="text" placeholder="Goal name (e.g. Emergency Fund)" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={styles.input} type="number" placeholder="Target amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
        <select style={styles.input} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">No linked account</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input style={styles.input} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <button style={styles.button} type="submit">Create Goal</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    color: 'var(--color-text-light)',
    width: '100%',
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
    alignItems: 'flex-start',
    gap: '12px',
  },
  goalName: {
    fontWeight: 'bold',
    margin: 0,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  achievedBadge: {
    backgroundColor: 'var(--color-neon-green)',
    color: '#111111',
    borderRadius: 'var(--radius-pill)',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  amounts: {
    color: 'var(--color-neon-green)',
    fontWeight: 'bold',
    fontSize: '14px',
    margin: 0,
    whiteSpace: 'nowrap',
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