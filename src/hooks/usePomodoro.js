import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createTimerSession,
  completeTimerSession,
  interruptTimerSession,
  getTodayStats,
} from '../services/timer.service';

// Duration presets (in seconds)
export const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#0d6efd' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: '#198754' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: '#6f42c1' },
};

const STORAGE_KEY = 'unitaser_timer_state';

export function usePomodoro() {
  // Load saved state
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode && MODES[parsed.mode]) return parsed.mode;
      }
    } catch (e) {}
    return 'focus';
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.timeLeft === 'number' && parsed.timeLeft > 0) {
          return parsed.timeLeft;
        }
      }
    } catch (e) {}
    return MODES.focus.duration;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [stats, setStats] = useState({ completedSessions: 0, totalFocusSeconds: 0 });
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unitaser_auto_breaks')) || false;
    } catch { return false; }
  });

  const intervalRef = useRef(null);
  const completionHandledRef = useRef(false);

  // Persist state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode,
        timeLeft,
      }));
    } catch (e) {}
  }, [mode, timeLeft]);

  // Persist auto-start setting
  useEffect(() => {
    try {
      localStorage.setItem('unitaser_auto_breaks', JSON.stringify(autoStartBreaks));
    } catch (e) {}
  }, [autoStartBreaks]);

  // Load today's stats on mount
  const loadStats = useCallback(async () => {
    try {
      const todayStats = await getTodayStats();
      setStats(todayStats);
    } catch (err) {
      console.error('Failed to load timer stats:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Sound notification using Web Audio API
  const playSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const playBeep = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Three-tone chime
      const now = ctx.currentTime;
      playBeep(880, now, 0.2);
      playBeep(1100, now + 0.25, 0.2);
      playBeep(1320, now + 0.5, 0.4);

      // Cleanup
      setTimeout(() => ctx.close(), 2000);
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }, []);

  // Handle session completion
  const handleComplete = useCallback(async () => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    setIsRunning(false);
    playSound();

    // Mark session completed in DB
    if (sessionId) {
      try {
        await completeTimerSession(sessionId);
        await loadStats();
      } catch (err) {
        console.error('Failed to complete session:', err);
      }
      setSessionId(null);
    }

    // Auto-switch to break (or back to focus)
    if (autoStartBreaks) {
      if (mode === 'focus') {
        const nextMode = 'shortBreak';
        setMode(nextMode);
        setTimeLeft(MODES[nextMode].duration);
        // Auto-start the break
        setTimeout(() => {
          completionHandledRef.current = false;
          startSession(nextMode);
        }, 1500);
      } else {
        const nextMode = 'focus';
        setMode(nextMode);
        setTimeLeft(MODES[nextMode].duration);
        setTimeout(() => {
          completionHandledRef.current = false;
          startSession(nextMode);
        }, 1500);
      }
    }
  }, [sessionId, mode, autoStartBreaks, playSound, loadStats]);

  // Main timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Trigger completion when timeLeft hits 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
  }, [timeLeft, isRunning, handleComplete]);

  // Start a session (creates DB record)
  const startSession = useCallback(async (sessionMode = null) => {
    const activeMode = sessionMode || mode;
    
    try {
      const session = await createTimerSession({
        mode: activeMode,
        duration: MODES[activeMode].duration,
      });
      setSessionId(session.id);
      completionHandledRef.current = false;
      setIsRunning(true);
    } catch (err) {
      console.error('Failed to start timer session:', err);
      setIsRunning(false);
    }
  }, [mode]);

  // Public API: Start / Pause / Reset / Switch mode

  const start = useCallback(() => {
    if (timeLeft <= 0) {
      // Reset to current mode duration and start
      setTimeLeft(MODES[mode].duration);
    }
    startSession();
  }, [timeLeft, mode, startSession]);

  const pause = useCallback(async () => {
    setIsRunning(false);
    if (sessionId) {
      try {
        await interruptTimerSession(sessionId);
      } catch (err) {
        console.error('Failed to interrupt session:', err);
      }
      setSessionId(null);
    }
  }, [sessionId]);

  const reset = useCallback(async () => {
    setIsRunning(false);
    if (sessionId) {
      try {
        await interruptTimerSession(sessionId);
      } catch (err) {
        console.error('Failed to interrupt session:', err);
      }
      setSessionId(null);
    }
    completionHandledRef.current = false;
    setTimeLeft(MODES[mode].duration);
  }, [sessionId, mode]);

  const switchMode = useCallback(async (newMode) => {
    if (isRunning) {
      // Interrupt current session when switching
      if (sessionId) {
        try {
          await interruptTimerSession(sessionId);
        } catch (err) {
          console.error('Failed to interrupt session:', err);
        }
      }
    }
    setIsRunning(false);
    setSessionId(null);
    completionHandledRef.current = false;
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  }, [isRunning, sessionId]);

  // Cleanup on unmount — pause without interrupting the DB record
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    mode,
    timeLeft,
    isRunning,
    stats,
    autoStartBreaks,
    setAutoStartBreaks,
    start,
    pause,
    reset,
    switchMode,
    refreshStats: loadStats,
  };
}