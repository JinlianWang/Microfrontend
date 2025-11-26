import React, { useEffect } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import Clock from './components/Clock.jsx';
import { ensureTimerElement } from './timerElement.js';

const ClockRoute = () => (
  <section style={styles.clockSection}>
    <p style={styles.copy}>Keep an eye on the time with the live clock below.</p>
    <Clock />
  </section>
);

const TimerRoute = () => {
  useEffect(() => {
    ensureTimerElement();
  }, []);

  return (
    <section style={styles.timerPanel}>
      <h3 style={styles.timerTitle}>Shared Timer Web Component</h3>
      <p style={styles.timerCopy}>
        This timer is exposed as a standalone web component that other micro frontends can reuse.
      </p>
      <mfe1-shared-timer />
    </section>
  );
};

const App = () => (
  <div style={styles.page}>
    <header>
      <h2>Hello from Lucas</h2>
      <p>Explore the clock widget or interact with the shared timer component.</p>
    </header>

    <nav style={styles.tabs}>
      <NavLink
        to="clock"
        end
        style={({ isActive }) => ({
          ...styles.tabLink,
          ...(isActive ? styles.tabLinkActive : {}),
        })}
      >
        Analog Clock
      </NavLink>
      <NavLink
        to="timer"
        end
        style={({ isActive }) => ({
          ...styles.tabLink,
          ...(isActive ? styles.tabLinkActive : {}),
        })}
      >
        Shared Timer
      </NavLink>
    </nav>

    <div style={styles.routeArea}>
      <Routes>
        <Route path="clock" element={<ClockRoute />} />
        <Route path="timer" element={<TimerRoute />} />
        <Route index element={<Navigate to="clock" replace />} />
        <Route path="*" element={<Navigate to="clock" replace />} />
      </Routes>
    </div>

    <p>
      <a href="/">Back to shell</a>
    </p>
  </div>
);

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
  clockSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  copy: {
    margin: 0,
    color: '#475569',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabLink: {
    border: '1px solid #cbd5f5',
    borderRadius: '999px',
    padding: '0.35rem 0.9rem',
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 600,
    background: '#f8fafc',
    transition: 'background 0.2s ease, border 0.2s ease',
  },
  tabLinkActive: {
    borderColor: '#2563eb',
    background: '#2563eb',
    color: '#fff',
  },
  routeArea: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    background: '#fff',
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
