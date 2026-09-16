import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createTimerSession,
  completeTimerSession,
  interruptTimerSession,
  getTodayStats,
} from '../services/timer.service';
import { usePomodoroSettings } from './usePomodoroSettings';

// Mode colors + labels (durations come from settings)
export const MODE_META = {
  focus: { label: 'Focus', color: '#0d6efd' },
  shortBreak: { label: 'Short Break', color: '#198754' },
  longBreak: { label: 'Long Break', color: '#6f42c1' },
};

const STATE_KEY = 'unitaser_timer_state';

export function usePomodoro() {
  const { settings } = usePomodoroSettings();

  // Duration in seconds for each mode (from settings)
  const durations = {
    focus: settings.focusMinutes * 60,
    shortBreak: settings.shortBreakMinutes * 60,
    longBreak: settings.longBreakMinutes * 60,
  };

  // ---------- State ----------
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode && MODE_META[parsed.mode]) return parsed.mode;
      }
    } catch (e) {}
    return 'focus';
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.timeLeft === 'number' && parsed.timeLeft > 0) {
          return parsed.timeLeft;
        }
      }
    } catch (e) {}
    return 25 * 60;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [completedFocusCount, setCompletedFocusCount] = useState(0);
  const [stats, setStats] = useState({ completedSessions: 0, totalFocusSeconds: 0 });

  const intervalRef = useRef(null);
  const completionHandledRef = useRef(false);

  // ---------- Persistence ----------
  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({ mode, timeLeft }));
    } catch (e) {}
  }, [mode, timeLeft]);

  // ---------- React to duration setting changes ----------
  // If the user changes a duration while the timer is NOT running,
  // reset the current mode's time to the new value.
  useEffect(() => {
    if (!isRunning && sessionId === null) {
      setTimeLeft(durations[mode]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes, mode]);

  // ---------- Stats ----------
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

  // ---------- Sound ----------
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

      const now = ctx.currentTime;
      playBeep(880, now, 0.2);
      playBeep(1100, now + 0.25, 0.2);
      playBeep(1320, now + 0.5, 0.4);

      setTimeout(() => ctx.close(), 2000);
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }, []);

  // ---------- Start session ----------
  const startSession = useCallback(async (sessionMode, durationSeconds) => {
    const activeMode = sessionMode || mode;
    const duration = durationSeconds || durations[activeMode];
    try {
      const session = await createTimerSession({
        mode: activeMode,
        duration,
      });
      setSessionId(session.id);
      completionHandledRef.current = false;
      setIsRunning(true);
    } catch (err) {
      console.error('Failed to start timer session:', err);
      setIsRunning(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);

  // ---------- Handle session completion ----------
  const handleComplete = useCallback(async () => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    setIsRunning(false);
    playSound();

    const wasFocus = mode === 'focus';

    if (sessionId) {
      try {
        await completeTimerSession(sessionId);
        await loadStats();
      } catch (err) {
        console.error('Failed to complete session:', err);
      }
      setSessionId(null);
    }

    // Compute next mode
    let nextMode;
    let newFocusCount = completedFocusCount;

    if (wasFocus) {
      newFocusCount = completedFocusCount + 1;
      setCompletedFocusCount(newFocusCount);

      const sessionsBefore = settings.sessionsBeforeLongBreak || 4;
      if (newFocusCount % sessionsBefore === 0) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'shortBreak';
      }
    } else {
      nextMode = 'focus';
    }

    // Move to next mode
    setMode(nextMode);
    const nextDuration = durations[nextMode];
    setTimeLeft(nextDuration);

    // Auto-start if enabled
    const shouldAutoStart =
      (nextMode === 'focus' && settings.autoStartFocus) ||
      (nextMode !== 'focus' && settings.autoStartBreaks);

    if (shouldAutoStart) {
      setTimeout(() => {
        completionHandledRef.current = false;
        startSession(nextMode, nextDuration);
      }, 1500);
    } else {
      completionHandledRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, mode, completedFocusCount, settings, loadStats, playSound, startSession]);

  // ---------- Timer tick ----------
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // ---------- Trigger completion ----------
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
  }, [timeLeft, isRunning, handleComplete]);

  // ---------- Public API ----------
  const start = useCallback(() => {
    const duration = durations[mode];
    if (timeLeft <= 0 || timeLeft > duration) {
      setTimeLeft(duration);
    }
    startSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, mode, startSession, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);

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
    setTimeLeft(durations[mode]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, mode, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);

  // ---------- Skip to next session ----------
  const skip = useCallback(async () => {
    // Interrupt current session (marked as 'interrupted', not 'completed')
    if (sessionId) {
      try {
        await interruptTimerSession(sessionId);
      } catch (err) {
        console.error('Failed to interrupt session:', err);
      }
      setSessionId(null);
    }

    const wasFocus = mode === 'focus';
    let nextMode;

    if (wasFocus) {
      const sessionsBefore = settings.sessionsBeforeLongBreak || 4;
      const newFocusCount = completedFocusCount + 1;
      setCompletedFocusCount(newFocusCount);
      nextMode = newFocusCount % sessionsBefore === 0 ? 'longBreak' : 'shortBreak';
    } else {
      nextMode = 'focus';
    }

    completionHandledRef.current = false;
    setIsRunning(false);
    setMode(nextMode);
    setTimeLeft(durations[nextMode]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, mode, completedFocusCount, settings.sessionsBeforeLongBreak, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);

  const switchMode = useCallback(async (newMode) => {
    if (isRunning && sessionId) {
      try {
        await interruptTimerSession(sessionId);
      } catch (err) {
        console.error('Failed to interrupt session:', err);
      }
    }
    setIsRunning(false);
    setSessionId(null);
    completionHandledRef.current = false;
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, sessionId, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);

  // Compute how many focus sessions completed since the last long break
  const sessionsUntilLongBreak = (() => {
    const sessionsBefore = settings.sessionsBeforeLongBreak || 4;
    const remainder = completedFocusCount % sessionsBefore;
    return sessionsBefore - remainder;
  })();

  return {
    mode,
    timeLeft,
    isRunning,
    stats,
    completedFocusCount,
    sessionsUntilLongBreak,
    durations,
    settings,
    start,
    pause,
    reset,
    skip,
    switchMode,
    refreshStats: loadStats,
  };
}