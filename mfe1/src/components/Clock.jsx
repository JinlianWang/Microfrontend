import React, { useEffect, useMemo, useState } from 'react';
import styles from './Clock.module.css';

const buildTicks = () =>
  Array.from({ length: 60 }, (_, index) => ({
    id: index,
    rotation: index * 6,
    major: index % 5 === 0,
  }));

const ticks = buildTicks();

const formatTime = (date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatDate = (date) =>
  date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

const Clock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { hourAngle, minuteAngle, secondAngle } = useMemo(() => {
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    return {
      hourAngle: hours * 30 + minutes * 0.5,
      minuteAngle: minutes * 6 + seconds * 0.1,
      secondAngle: seconds * 6,
    };
  }, [now]);

  return (
    <div className={styles.clockWidget}>
      <div className={styles.clockFace}>
        {ticks.map((tick) => (
          <span
            key={tick.id}
            className={`${styles.tick} ${tick.major ? styles.tickMajor : ''}`}
            style={{ transform: `rotate(${tick.rotation}deg)` }}
          />
        ))}

        <span
          className={`${styles.hand} ${styles.hourHand}`}
          style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
        />
        <span
          className={`${styles.hand} ${styles.minuteHand}`}
          style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
        />
        <span
          className={`${styles.hand} ${styles.secondHand}`}
          style={{ transform: `translateX(-50%) rotate(${secondAngle}deg)` }}
        />
        <span className={styles.centerCap} />
      </div>

      <div className={styles.digitalLabel}>{formatTime(now)}</div>
      <div className={styles.metaRow}>
        <span>{formatDate(now)}</span>
      </div>
    </div>
  );
};

export default Clock;
