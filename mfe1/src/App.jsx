import React from 'react';
import Clock from './components/Clock.jsx';

const App = () => (
  <div style={styles.page}>
    <header>
      <h2>Hello from Lucas</h2>
      <p>Keep an eye on the time with the live clock below.</p>
    </header>

    <Clock />

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
};

export default App;
