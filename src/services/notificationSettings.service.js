const STORAGE_KEY = 'unitaser_notification_prefs';

const DEFAULT_PREFS = {
  visual: true,        // in-app + OS notifications
  sound: true,         // beep tone
  voice: false,        // read reminder aloud via SpeechSynthesis
  vibrate: true,       // mobile vibration (no-op on desktop)
};

export function getNotificationPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to read notification prefs:', e);
  }
  return { ...DEFAULT_PREFS };
}

export function saveNotificationPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save notification prefs:', e);
  }
}

export function getDefaultPrefs() {
  return { ...DEFAULT_PREFS };
}