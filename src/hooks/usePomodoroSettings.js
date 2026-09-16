import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'unitaser_pomodoro_settings';

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

export function usePomodoroSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Listen for updates from other instances of this hook
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      // Notify other hook instances in the same tab
      window.dispatchEvent(new CustomEvent('pomodoroSettingsChange', { detail: updated }));
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    window.dispatchEvent(new CustomEvent('pomodoroSettingsChange', { detail: DEFAULT_SETTINGS }));
  }, []);

  // Listen for changes from other instances in the same tab
  useEffect(() => {
    const handleChange = (e) => {
      setSettings(e.detail);
    };
    window.addEventListener('pomodoroSettingsChange', handleChange);
    return () => window.removeEventListener('pomodoroSettingsChange', handleChange);
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
    DEFAULT_SETTINGS,
  };
}