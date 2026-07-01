import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Play, Pause, RotateCcw, Timer, Settings2 } from 'lucide-react';
import { useStore } from '../store';

export function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [sessionCount, setSessionCount] = useState(0);

  const durationMap = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      // Automatically transition or play sound
      if (mode === 'pomodoro') {
        setSessionCount(c => c + 1);
        if ((sessionCount + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(durationMap.longBreak);
        } else {
          setMode('shortBreak');
          setTimeLeft(durationMap.shortBreak);
        }
      } else {
        setMode('pomodoro');
        setTimeLeft(durationMap.pomodoro);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, sessionCount]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durationMap[mode]);
  };

  const changeMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(durationMap[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-accent-primary" />
            Focus Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="flex gap-2 mb-8 bg-bg-elevated p-1 rounded-md">
            <button
              onClick={() => changeMode('pomodoro')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'pomodoro' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => changeMode('shortBreak')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'shortBreak' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Short Break
            </button>
            <button
              onClick={() => changeMode('longBreak')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'longBreak' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Long Break
            </button>
          </div>

          <div className="text-8xl font-mono text-accent-primary mb-12 tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={toggleTimer}
              className={`w-32 flex items-center justify-center gap-2 ${isActive ? 'bg-accent-danger hover:bg-red-600 text-white border-none' : ''}`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
              className="w-16 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-12 text-center text-text-secondary">
            <p className="text-sm">Completed Sessions: <span className="text-accent-primary font-bold">{sessionCount}</span> / 4</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
