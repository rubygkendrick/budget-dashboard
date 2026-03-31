// Profile page: allows the logged in user to update their name or email.
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppTitle from '../components/AppTitle';

export default function ProfilePage() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }

      login(token!, data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div style={styles.container}>
    <AppTitle />
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Profile</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Save Changes</button>
        </form>

        <button onClick={() => navigate('/dashboard')} style={styles.back}>
          ← Back to Dashboard
        </button>
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
    justifyContent: 'center',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow-card)',
    border: 'var(--border-chunky-light)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: 'var(--color-text-light)',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    marginTop: 0,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
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
  success: {
    color: 'var(--color-success)',
    fontSize: '14px',
    marginBottom: '12px',
  },
  error: {
    color: 'var(--color-danger)',
    fontSize: '14px',
    marginBottom: '12px',
  },
  back: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    marginTop: '16px',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
  },
};