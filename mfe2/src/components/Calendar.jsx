import React from 'react';
import styles from './Calendar.module.css';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];

  for (let i = 0; i < firstDay; i += 1) {
    grid.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    grid.push(new Date(year, month, day));
  }

  return grid;
};

const Calendar = ({
  referenceDate,
  selectedDate,
  onSelectDay,
  onPreviousMonth,
  onNextMonth,
}) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const grid = buildCalendarGrid(year, month);
  const today = new Date();
  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" className={styles.navButton} onClick={onPreviousMonth}>
          ‹
        </button>
        <div className={styles.monthLabel}>
          {referenceDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" className={styles.navButton} onClick={onNextMonth}>
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        {weekdayLabels.map((label) => (
          <div key={label} className={styles.weekday}>
            {label}
          </div>
        ))}
      </div>

      <div className={styles.days}>
        {grid.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={styles.inactive} />;
          }

          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          const classNames = [styles.dayButton];
          if (isToday) classNames.push(styles.today);
          if (isSelected) classNames.push(styles.selected);

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={classNames.join(' ')}
              onClick={() => onSelectDay(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendToday}`} />
          Today
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSelected}`} />
          Selected
        </div>
      </div>
    </div>
  );
};

export default Calendar;
