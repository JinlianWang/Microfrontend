import React, { useMemo, useState } from 'react';
import Calendar from './components/Calendar.jsx';
import RemoteTimerBridge from './components/RemoteTimerBridge.jsx';

const formatDate = (date) =>
  date?.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const formatElapsed = (value) => {
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const App = () => {
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [sharedElapsed, setSharedElapsed] = useState(0);

  const onPreviousMonth = () => {
    setReferenceDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const onNextMonth = () => {
    setReferenceDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const onSelectDay = (date) => {
    setSelectedDate(date);
  };

  const summary = useMemo(() => formatDate(selectedDate), [selectedDate]);

  return (
    <div style={styles.page}>
      <h2>Hello from Sunny</h2>
      <p>Plan events with the embedded calendar below.</p>

      <Calendar
        referenceDate={referenceDate}
        selectedDate={selectedDate}
        onSelectDay={onSelectDay}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />

      <p style={styles.selectedLabel}>
        Selected Date: <strong>{summary}</strong>
      </p>

      <section style={styles.timerSection}>
        <h3 style={styles.timerTitle}>Web component bridge</h3>
        <p style={styles.timerCopy}>
          Tap the button to pull in the timer component hosted by MFE1. Start or pause it in the
          dialog and we&apos;ll mirror the elapsed time below.
        </p>
        <RemoteTimerBridge onElapsedChange={setSharedElapsed} />
        <p style={styles.timerSummary}>
          Remote timer reported: <strong>{formatElapsed(sharedElapsed)}</strong>
        </p>
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
    maxWidth: '480px',
    margin: '0 auto',
    padding: '1.5rem 1rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    color: '#0f172a',
  },
  selectedLabel: {
    fontSize: '0.95rem',
  },
  timerSection: {
    border: '1px solid #bae6fd',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: '#f0f9ff',
  },
  timerTitle: {
    margin: 0,
  },
  timerCopy: {
    margin: 0,
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: 1.4,
  },
  timerSummary: {
    margin: 0,
    fontSize: '0.95rem',
  },
};

export default App;
