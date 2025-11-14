import React, { useMemo, useState } from 'react';
import Calendar from './components/Calendar.jsx';

const formatDate = (date) =>
  date?.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const App = () => {
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

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
};

export default App;
