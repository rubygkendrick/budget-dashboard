// Layout: wraps all authenticated pages with the sidebar and main content area.
import Sidebar from "./SideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        {children}
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
};