// Login page: allows existing users to sign in with email and password and receive a JWT token.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div style={styles.container}>

      <h1 style={styles.appTitle}>
        {'budget dashboard'.split('').map((char, i) => (
          <span key={i} style={{ color: titleColors[i % 4] }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Log In</button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const titleColors = [
  'var(--color-neon-yellow)',
  '#ffffff',
  'var(--color-neon-green)',
  'var(--color-neon-pink)',
];

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
  appTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '3rem',
    fontWeight: 700,
    textTransform: 'lowercase',
    letterSpacing: '0.02em',
    margin: 0,
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
  error: {
    color: 'var(--color-danger)',
    fontSize: '14px',
    marginBottom: '12px',
  },
  footer: {
    color: 'var(--color-text-muted)',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '20px',
  },
  link: {
    color: 'var(--color-neon-yellow)',
    textDecoration: 'none',
  },
};