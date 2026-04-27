// AI Chat page: placeholder for AI-powered financial assistant. Will connect to Anthropic API when ready.
import { useState } from 'react';
import AppTitle from '../components/AppTitle';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI financial assistant. I\'ll be able to answer questions about your spending, budgets, and goals. This feature is coming soon!',
    },
  ]);
  const [input, setInput] = useState('');

  function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const placeholderReply: Message = {
      role: 'assistant',
      content: 'AI chat is coming soon! Once connected, I\'ll be able to answer questions like "How much did I spend on food this month?" or "Am I on track with my savings goals?"',
    };

    setMessages([...messages, userMessage, placeholderReply]);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={styles.container}>
      <AppTitle />

      <h2 style={styles.heading}>AI Financial Assistant</h2>
      <p style={styles.subtitle}>Ask me anything about your finances.</p>

      <div style={styles.chatBox}>
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-bg-input)',
                color: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-light)',
              }}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Ask about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.button} onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
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
    marginBottom: '8px',
    marginTop: '32px',
    color: 'var(--color-text-light)',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '14px',
    marginBottom: '24px',
    marginTop: 0,
  },
  chatBox: {
    backgroundColor: 'var(--color-bg-card)',
    border: 'var(--border-chunky-light)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderTop: 'var(--border-chunky-light)',
  },
  input: {
    flex: 1,
    backgroundColor: 'var(--color-bg-input)',
    border: 'var(--border-chunky-light)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
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
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-btn)',
    fontFamily: 'var(--font-sans)',
  },
};