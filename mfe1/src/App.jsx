import React, { useEffect } from 'react';
import Clock from './components/Clock.jsx';
import { ensureTimerElement } from './timerElement.js';

const App = () => {
  useEffect(() => {
    ensureTimerElement();
  }, []);

  return (
    <div style={styles.page}>
      <header>
        <h2>Hello from Lucas</h2>
        <p>Keep an eye on the time with the live clock below.</p>
      </header>

      <Clock />

      <section style={styles.timerPanel}>
        <h3 style={styles.timerTitle}>Shared Timer Web Component</h3>
        <p style={styles.timerCopy}>
          This timer is exposed as a standalone web component that other micro frontends can reuse.
        </p>
        <mfe1-shared-timer />
      </section>

      <p>
        <a href="/">Back to shell</a>
      </p>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    maxWidth: '540px',
    margin: '0 auto',
    padding: '1.5rem 1rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    color: '#0f172a',
  },
  timerPanel: {
    border: '1px solid #cbd5f5',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    background: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  timerTitle: {
    margin: 0,
  },
  timerCopy: {
    margin: 0,
    color: '#475569',
    fontSize: '0.95rem',
  },
};

export default App;
