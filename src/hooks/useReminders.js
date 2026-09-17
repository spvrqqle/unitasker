import { useEffect, useRef } from 'react';
import { checkAllReminders, requestNotificationPermission } from '../services/reminder.service';

const CHECK_INTERVAL_MS = 20 * 1000; // check every 20 seconds

export function useReminders() {
  const intervalRef = useRef(null);

  useEffect(() => {
    // Ask for permission once on mount (browser will remember the answer)
    requestNotificationPermission();

    // Run an initial check
    checkAllReminders();

    // Then check on interval
    intervalRef.current = setInterval(() => {
      checkAllReminders();
    }, CHECK_INTERVAL_MS);

    // Also check when the user returns to the tab
    const handleVisibility = () => {
      if (!document.hidden) checkAllReminders();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);
}