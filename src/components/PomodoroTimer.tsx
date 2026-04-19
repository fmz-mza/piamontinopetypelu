import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Battery, Timer } from 'lucide-react';

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
    work: {
      bg: "from-rose-500 to-rose-600",
      shadow: "shadow-rose-700/40",
      border: "border-rose-700",
      text: "text-rose-500"
    },
    shortBreak: {
      bg: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-700/40",
      border: "border-emerald-700",
      text: "text-emerald-500"
    },
    longBreak: {
      bg: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-700/40",
      border: "border-blue-700",
      text: "text-blue-500"
    }
  };

  return (
    <div className={`p-1.5 rounded-[3rem] bg-gradient-to-br ${theme[mode].bg} shadow-2xl transition-all duration-700`}>
      <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[2.8rem] w-85 flex flex-col items-center space-y-8">
        
        {/* Mode Selector */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full gap-1 shadow-inner">
          {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setTimeLeft(m === 'work' ? 25 * 60 : m === 'shortBreak' ? 5 * 60 : 15 * 60); setIsRunning(false); }}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                mode === m 
                  ? 'bg-white text-gray-800 shadow-[0_4px_0_rgba(0,0,0,0.05)] translate-y-[-1px]' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>

        {/* Timer Circle with Animation */}
        <div className="relative flex items-center justify-center group">
          <div className="absolute inset-0 bg-gray-50 rounded-full scale-95 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <svg className="w-64 h-64 transform -rotate-90 relative z-10">
            <circle cx="128" cy="128" r="118" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
            <circle
              cx="128" cy="128" r="118" stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={741}
              strokeDashoffset={741 - (741 * progress) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${theme[mode].text}`}
            />
          </svg>
          
          <div className="absolute flex flex-col items-center z-20">
            {/* Stopwatch Animation */}
            <div className={`mb-2 transition-transform duration-500 ${isRunning ? 'animate-bounce' : ''}`}>
              <Timer size={32} className={`${theme[mode].text} ${isRunning ? 'animate-pulse' : 'opacity-30'}`} />
            </div>
            
            <span className="text-6xl font-black text-gray-800 tabular-nums tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            
            <div className={`flex items-center mt-3 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 ${theme[mode].text} shadow-sm`}>
              {mode === 'work' ? <Brain size={14} /> : mode === 'shortBreak' ? <Coffee size={14} /> : <Battery size={14} />}
              <span className="text-[10px] uppercase font-black ml-2 tracking-[0.2em]">
                {mode === 'work' ? 'Focus' : 'Rest'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls 3D - Uniform Size */}
        <div className="flex items-center justify-center space-x-6 w-full">
          <button 
            onClick={resetTimer} 
            className="w-16 h-16 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-gray-50 rounded-2xl border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 transition-all shadow-sm"
          >
            <RotateCcw size={24} />
          </button>
          
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all transform active:translate-y-1 active:border-b-0 border-b-[6px] ${theme[mode].border} ${theme[mode].bg} text-white shadow-xl ${theme[mode].shadow}`}
          >
            {isRunning ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />}
          </button>

          <div className="w-16 h-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-b-4 border-gray-200 shadow-sm">
            <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Done</span>
            <span className="text-xl font-black text-gray-700 leading-none">{completedPomodoros}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;