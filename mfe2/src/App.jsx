import React, { useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
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

const CalendarRoute = ({
  referenceDate,
  selectedDate,
  onSelectDay,
  onPreviousMonth,
  onNextMonth,
}) => {
  const summary = useMemo(() => formatDate(selectedDate), [selectedDate]);

  return (
    <div style={styles.calendarSection}>
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
    </div>
  );
};

const TimerRoute = ({ sharedElapsed, onElapsedChange }) => (
  <section style={styles.timerSection}>
    <h3 style={styles.timerTitle}>Web component bridge</h3>
    <p style={styles.timerCopy}>
      Tap the button to pull in the timer component hosted by MFE1. Start or pause it in the dialog
      and we&apos;ll mirror the elapsed time below.
    </p>
    <RemoteTimerBridge onElapsedChange={onElapsedChange} />
    <p style={styles.timerSummary}>
      Remote timer reported: <strong>{formatElapsed(sharedElapsed)}</strong>
    </p>
  </section>
);

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

  return (
    <div style={styles.page}>
      <h2>Hello from Sunny</h2>
      <p>Plan events with the embedded calendar or experiment with the shared timer.</p>

      <nav style={styles.tabs}>
        <NavLink
          to="calendar"
          end
          style={({ isActive }) => ({
            ...styles.tabLink,
            ...(isActive ? styles.tabLinkActive : {}),
          })}
        >
          Calendar
        </NavLink>
        <NavLink
          to="timer"
          end
          style={({ isActive }) => ({
            ...styles.tabLink,
            ...(isActive ? styles.tabLinkActive : {}),
          })}
        >
          Timer
        </NavLink>
      </nav>

      <div style={styles.routeArea}>
        <Routes>
          <Route
            path="calendar"
            element={
              <CalendarRoute
                referenceDate={referenceDate}
                selectedDate={selectedDate}
                onSelectDay={onSelectDay}
                onPreviousMonth={onPreviousMonth}
                onNextMonth={onNextMonth}
              />
            }
          />
          <Route
            path="timer"
            element={<TimerRoute sharedElapsed={sharedElapsed} onElapsedChange={setSharedElapsed} />}
          />
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="*" element={<Navigate to="calendar" replace />} />
        </Routes>
      </div>

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
  calendarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabLink: {
    border: '1px solid #bae6fd',
    borderRadius: '999px',
    padding: '0.35rem 0.9rem',
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 600,
    background: '#f0f9ff',
    transition: 'background 0.2s ease, border 0.2s ease',
  },
  tabLinkActive: {
    background: '#0ea5e9',
    borderColor: '#0ea5e9',
    color: '#fff',
  },
  routeArea: {
    border: '1px solid #bae6fd',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    background: '#fff',
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
