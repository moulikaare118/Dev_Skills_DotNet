import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'devskills-assessment-timer';

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function Timer({ initialSeconds = 5400, onExpire, active = true }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedSeconds = parseInt(saved, 10);
      if (!Number.isNaN(savedSeconds) && savedSeconds >= 0) {
        setSecondsLeft(savedSeconds);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(secondsLeft));
  }, [secondsLeft]);

  useEffect(() => {
    if (!active || secondsLeft <= 0) {
      if (secondsLeft <= 0) {
        onExpire?.();
      }
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [active, secondsLeft, onExpire]);

  const time = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

  return <span className="text-lg font-semibold text-slate-900">{time}</span>;
}
