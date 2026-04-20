// Layout — wraps all authenticated pages with the sidebar and main content area.
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-page)',
  },
  main: {
    marginLeft: '230px',
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
 content: {
    maxWidth: '1100px',
    width: '100%',
  },
};