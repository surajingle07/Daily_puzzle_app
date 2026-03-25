import { useState, useEffect } from 'react';

export default function Timer({ isRunning, onTimeUpdate }) {
  const [timeMs, setTimeMs] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning) {
      const startTime = Date.now() - timeMs;
      interval = setInterval(() => {
        const currentMs = Date.now() - startTime;
        setTimeMs(currentMs);
        if (onTimeUpdate) onTimeUpdate(currentMs);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeMs, onTimeUpdate]);

  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="font-mono text-lg font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg inline-block">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>);

}