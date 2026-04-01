// ProtectedRoute:redirects unauthenticated users to the login page.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}