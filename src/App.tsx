import React from 'react';
import PomodoroTimer from './components/PomodoroTimer';

function App() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-100/50 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <PomodoroTimer />
      </div>

      <footer className="mt-12 relative z-10">
        <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">
          Focus • Rest • Repeat
        </p>
      </footer>
    </main>
  );
}

export default App;