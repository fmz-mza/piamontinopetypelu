import React, { useState, useEffect } from 'react';
import { Button, Clock, Text } from '@shadcn/ui';

const PomodoroTimer = () => {
  const [time, setTime] = useState({ minutes: 25, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isLongBreak, setIsLongBreak] = useState(false);

  // Timer logic
  const startTimer = () => {
    setIsRunning(true);
    const timer = setInterval(() => {
      if (time.seconds > 0) {
        setTime({ ...time, seconds: time.seconds - 1 });
      } else if (time.minutes > 0) {
        setTime({ ...time, minutes: time.minutes - 1, seconds: 59 });
      } else {
        setIsRunning(false);
        clearInterval(timer);
        setIntervalId(null);

        // Update completed Pomodoros
        if (!isLongBreak) {
          setCompletedPomodoros(completedPomodoros + 1);
          if (completedPomodoros % 4 === 0) {
            setIsLongBreak(true);
          }
        }

        // Set break duration
        const breakDuration = isLongBreak ? 15 : 5;
        setTime({ minutes: breakDuration, seconds: 0 });
        setIsLongBreak(false);
      }
    }, 1000);
    setIntervalId(timer);
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalId);
  };

  const resetTimer = () => {
    stopTimer();
    setTime({ minutes: 25, seconds: 0 });
    setIsLongBreak(false);
    setCompletedPomodoros(0);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Pomodoro Timer</h1>

      <Clock
        time={`${time.minutes}:${time.seconds < 10 ? '0' : ''}${time.seconds}`}
        className="text-4xl font-bold text-center mb-4"
      />

      <div className="flex justify-center mb-4">
        <Button
          onClick={isRunning ? stopTimer : startTimer}
          className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>

        <Button
          onClick={resetTimer}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Reset
        </Button>
      </div>

      <Text className="text-center text-sm">
        {isLongBreak ? 'Long Break' : 'Break'}
      </Text>

      <Text className="text-center text-sm mt-2">
        Pomodoros Completed: {completedPomodoros}
      </Text>
    </div>
  );
};

export default PomodoroTimer;