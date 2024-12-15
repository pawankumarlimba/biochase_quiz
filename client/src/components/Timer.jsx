import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ handleSubmit, endTime }) => {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        handleSubmit(); // Trigger auto-submit when time is up
      } else {
        setTimeLeft(remainingTime);
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [endTime, handleSubmit]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const days = Math.floor(totalSeconds / 86400); // 1 day = 86400 seconds
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days > 0 ? `${days}d ` : ''}${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return <div className="text-xl font-bold">Time Left: {formatTime(timeLeft)}</div>;
};

export default CountdownTimer;
