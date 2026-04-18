import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Battery } from 'lucide-react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  
  const timerRef = useRef<any>(null);
  const totalTime = mode === 'work' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      if (newCount % 4 === 0) { setMode('longBreak'); setTimeLeft(15 * 60); }
      else { setMode('shortBreak'); setTimeLeft(5 * 60); }
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const theme = {
    work: "from-rose-500 to-orange-500",
    shortBreak: "from-emerald-400 to-teal-500",
    longBreak: "from-blue-500 to-indigo-600"
  };

  return (
    <div className={`p-1 rounded-3xl bg-gradient-to-br ${theme[mode]} shadow-2xl transition-all duration-700`}>
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.4rem] w-80 flex flex-col items-center space-y-8">
        
        {/* Mode Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full">
          {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setTimeLeft(m === 'work' ? 25 * 60 : m === 'shortBreak' ? 5 * 60 : 15 * 60); setIsRunning(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === m ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
            <circle
              cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${mode === 'work' ? 'text-rose-500' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-blue-500'}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-gray-800 tabular-nums tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <div className="flex items-center mt-1 text-gray-400">
              {mode === 'work' ? <Brain size={14} /> : mode === 'shortBreak' ? <Coffee size={14} /> : <Battery size={14} />}
              <span className="text-[10px] uppercase font-bold ml-1 tracking-widest">
                {mode === 'work' ? 'Focusing' : 'Resting'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <button onClick={resetTimer} className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
              isRunning 
                ? 'bg-gray-800 text-white hover:bg-gray-900' 
                : `bg-gradient-to-br ${theme[mode]} text-white hover:opacity-90 shadow-xl`
            }`}
          >
            {isRunning ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} className="ml-1" />}
          </button>

          <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100">
            <span className="text-xs font-bold text-gray-600">{completedPomodoros}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;