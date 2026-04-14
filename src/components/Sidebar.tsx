// Sidebar: main navigation for the app, displayed on all authenticated pages.
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  Target,
  RefreshCw,
  BarChart2,
  MessageSquare,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Accounts', path: '/accounts', icon: Landmark },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Categories', path: '/categories', icon: Tag },
  { label: 'Budgets', path: '/budgets', icon: PiggyBank },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Recurring', path: '/recurring', icon: RefreshCw },
  { label: 'Reports', path: '/reports', icon: BarChart2 },
  { label: 'AI Chat', path: '/ai-chat', icon: MessageSquare },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside style={styles.sidebar}>
      <h1 style={styles.logo}>Budget Dashboard</h1>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? 'var(--color-neon-yellow)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-light)',
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button onClick={handleLogout} style={styles.logout}>
        <LogOut size={16} />
        Log Out
      </button>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '230px',
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    top: 0,
    left: 0,
    borderRight: 'var(--border-chunky-light)',
  },
  logo: {
    color: 'var(--color-neon-yellow)',
    fontFamily: 'var(--font-sans)',
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '32px',
    marginTop: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 500,
    textAlign: 'left',
    width: '100%',
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    border: '2.5px solid var(--color-danger)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-danger)',
    padding: '10px 14px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    marginTop: '24px',
  },
};