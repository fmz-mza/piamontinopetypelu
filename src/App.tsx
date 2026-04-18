import React from 'react';
import PomodoroTimer from './components/PomodoroTimer';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-rose-50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[120px]" />
      </div>
      <PomodoroTimer />
      <p className="mt-8 text-gray-400 text-xs font-medium tracking-widest uppercase">
        Stay focused, be productive
      </p>
    </div>
  );
}

export default App;