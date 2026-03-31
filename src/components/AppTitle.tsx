// Reusable app title component that displays the 'budget dashboard' 
// heading with alternating neon colors.
const titleColors = [
  'var(--color-neon-yellow)',
  '#ffffff',
  'var(--color-neon-green)',
  'var(--color-neon-pink)',
];

export default function AppTitle() {
  return (
    <h1 style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '3rem',
      fontWeight: 700,
      textTransform: 'lowercase',
      letterSpacing: '0.02em',
      margin: 0,
    }}>
      {'budget dashboard'.split('').map((char, i) => (
        <span key={i} style={{ color: titleColors[i % 4] }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}