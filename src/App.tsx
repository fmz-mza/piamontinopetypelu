import React from 'react';
import PomodoroTimer from './components/PomodoroTimer';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <PomodoroTimer />
    </div>
  );
}

export default App;