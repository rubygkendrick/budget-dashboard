//Categories page: displays all user categories and subcategories, 
// and allows creating, renaming, and deleting them.

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppTitle from '../components/AppTitle';

interface Category {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
}

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://localhost:5000/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategories(data);
      } catch {
        console.error('Failed to fetch categories');
      }
    }
    fetchCategories();
  }, [token]);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          type,
          parentId: parentId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create category');
        return;
      }

      setCategories([...categories, data]);
      setName('');
      setParentId('');
      setType('expense');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c.id !== id));
    } catch {
      console.error('Failed to delete category');
    }
  }

  async function handleUpdate(id: string, name: string) {
    try {
      await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, name } : c))
      );
      setEditingId(null);
    } catch {
      console.error('Failed to update category');
    }
  }

  const topLevel = categories.filter((c) => c.parentId === null);
  const subCategories = categories.filter((c) => c.parentId !== null);

  return (
    <div style={styles.container}>
      <AppTitle />

      <div style={styles.content}>
        <h2 style={styles.heading}>My Categories</h2>

        <div style={styles.categoryList}>
          {topLevel.length === 0 && (
            <p style={styles.empty}>No categories yet. Create one below!</p>
          )}
          {topLevel.map((category) => (
            <div key={category.id} style={styles.card}>
              <div>
                {editingId === category.id ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      style={styles.inlineInput}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button style={styles.editButton} onClick={() => handleUpdate(category.id, editName)}>Save</button>
                    <button style={styles.deleteButton} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <p style={styles.categoryName}>{category.name}</p>
                    <span style={styles.badge}>{category.type}</span>
                    <button style={styles.editButton} onClick={() => { setEditingId(category.id); setEditName(category.name); }}>Rename</button>
                    <button style={styles.deleteButton} onClick={() => handleDelete(category.id)}>Delete</button>
                  </div>
                )}
                <div style={styles.subList}>
                  {subCategories
                    .filter((s) => s.parentId === category.id)
                    .map((sub) => (
                      <div key={sub.id} style={styles.subCard}>
                        {editingId === sub.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              style={styles.inlineInput}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                            <button style={styles.editButton} onClick={() => handleUpdate(sub.id, editName)}>Save</button>
                            <button style={styles.deleteButton} onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <p style={styles.subName}>↳ {sub.name}</p>
                            <button style={styles.editButton} onClick={() => { setEditingId(sub.id); setEditName(sub.name); }}>Rename</button>
                            <button style={styles.deleteButton} onClick={() => handleDelete(sub.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={styles.heading}>Add Category</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleCreate} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            style={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select
            style={styles.input}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">No parent (top-level)</option>
            {topLevel.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button style={styles.button} type="submit">Create Category</button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-page)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '40px',
    gap: '24px',
  },
  content: {
    width: '100%',
    maxWidth: '600px',
    padding: '0 24px',
  },
  heading: {
    color: 'var(--color-text-light)',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  categoryList: {
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
  subList: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  subCard: {
    paddingLeft: '16px',
  },
  categoryName: {
    color: 'var(--color-text-light)',
    fontWeight: 'bold',
    margin: 0,
  },
  subName: {
    color: 'var(--color-text-muted)',
    margin: 0,
    fontSize: '14px',
  },
  badge: {
    backgroundColor: 'var(--color-bg-input)',
    color: 'var(--color-text-muted)',
    borderRadius: 'var(--radius-pill)',
    padding: '2px 10px',
    fontSize: '12px',
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
  inlineInput: {
    backgroundColor: 'var(--color-bg-input)',
    border: 'var(--border-chunky-light)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    color: 'var(--color-text-light)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
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