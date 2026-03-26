// Dashboard page: main landing page after login, will be built out in a later feature.
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        Log Out
      </button>
    </div>
  );
}