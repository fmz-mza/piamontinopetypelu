import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Clock } from 'lucide-react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(15 * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('work');
    setTimeLeft(25 * 60);
    setCompletedPomodoros(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-2 text-gray-500 font-medium uppercase tracking-wider text-sm">
          <Clock size={18} />
          <span>{mode === 'work' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
        </div>

        <div className="text-7xl font-bold text-gray-800 tabular-nums">
          {formatTime(timeLeft)}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${
              isRunning 
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {isRunning ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 w-full text-center">
          <p className="text-gray-500 text-sm">
            Sessions completed: <span className="font-bold text-gray-800">{completedPomodoros}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;