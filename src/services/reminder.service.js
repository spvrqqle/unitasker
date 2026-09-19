import { getAllTasks } from './task.service';
import { getAllRecords } from './database';
import { getNotificationPrefs } from './notificationSettings.service';

const NOTIFICATIONS_KEY = 'unitaser_notifications';
const FIRED_KEY = 'unitaser_fired_reminders';

// ---------- Permission ----------
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Notification permission request failed:', err);
    return 'denied';
  }
}

// ---------- Fired tracking ----------
function getFiredIds() {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markAsFired(id) {
  const fired = getFiredIds();
  if (!fired.includes(id)) {
    fired.push(id);
    const trimmed = fired.slice(-200);
    localStorage.setItem(FIRED_KEY, JSON.stringify(trimmed));
  }
}

export function clearFiredHistory() {
  localStorage.removeItem(FIRED_KEY);
}

// ---------- Notification drawer entry ----------
function appendToNotificationDrawer({ title, message, type = 'reminder' }) {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const newNotification = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      message,
      time: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotification, ...existing].slice(0, 50);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  } catch (err) {
    console.warn('Failed to append notification:', err);
  }
}

// ---------- Feedback modes ----------

// System (OS) notification
function fireSystemNotification({ title, body, tag }) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, {
      body,
      tag,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch (err) {
    console.warn('Failed to fire system notification:', err);
  }
}

// Audible alert (Web Audio API — three-note chime)
function playAlertSound() {
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
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playBeep(700, now, 0.15);
    playBeep(900, now + 0.18, 0.15);
    playBeep(1100, now + 0.36, 0.3);

    setTimeout(() => ctx.close(), 1500);
  } catch (err) {
    console.warn('Failed to play alert sound:', err);
  }
}

// Voice announcement via SpeechSynthesis
function speakReminder(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    // Cancel any pending speech so it doesn't queue up
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to pick a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      // Prefer an English voice
      const preferred = voices.find(v => v.lang && v.lang.startsWith('en')) || voices[0];
      utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Failed to speak reminder:', err);
  }
}

// Vibration (mobile only)
function vibrate() {
  if (!('vibrate' in navigator)) return;
  try {
    navigator.vibrate([200, 100, 200]);
  } catch (err) {
    console.warn('Failed to vibrate:', err);
  }
}

// Fire a multi-modal alert based on user preferences
export function fireMultiModalAlert({ title, body, tag }) {
  const prefs = getNotificationPrefs();

  if (prefs.visual) {
    fireSystemNotification({ title, body, tag });
  }
  if (prefs.sound) {
    playAlertSound();
  }
  if (prefs.voice) {
    // Strip emoji/formatting for cleaner speech
    const speechText = `${title}. ${body}`.replace(/[⏰📅]/g, '').trim();
    speakReminder(speechText);
  }
  if (prefs.vibrate) {
    vibrate();
  }
}

// ---------- Task reminder check ----------
export async function checkTaskReminders() {
  const now = Date.now();
  const firedIds = getFiredIds();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  let tasks;

  try {
    tasks = await getAllTasks();
  } catch (err) {
    console.warn('Failed to load tasks for reminder check:', err);
    return 0;
  }

  let fired = 0;

  for (const task of tasks || []) {
    if (!task.reminder) continue;
    if (task.status === 'Completed') continue;

    const reminderTime = new Date(task.reminder).getTime();
    if (isNaN(reminderTime)) continue;

    if (reminderTime > now) continue;
    if (reminderTime < oneDayAgo) continue;

    const firedKey = `task-${task.id}`;
    if (firedIds.includes(firedKey)) continue;

    const body = task.dueDate
      ? `Due ${new Date(task.dueDate).toLocaleString()}`
      : 'Reminder from UniTasker';

    fireMultiModalAlert({
      title: `⏰ ${task.title}`,
      body,
      tag: firedKey,
    });

    appendToNotificationDrawer({
      title: task.title,
      message: body,
      type: 'task',
    });

    markAsFired(firedKey);
    fired++;
  }

  return fired;
}

// ---------- Event reminder check ----------
export async function checkEventReminders() {
  const now = Date.now();
  const firedIds = getFiredIds();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  let events;

  try {
    events = await getAllRecords('events');
  } catch (err) {
    return 0;
  }

  let fired = 0;

  for (const event of events || []) {
    if (!event.date) continue;
    const eventTime = new Date(event.date).getTime();
    if (isNaN(eventTime)) continue;

    const fireAt = eventTime - 5 * 60 * 1000;
    if (fireAt > now) continue;
    if (fireAt < oneDayAgo) continue;

    const firedKey = `event-${event.id}`;
    if (firedIds.includes(firedKey)) continue;

    const body = `Starts at ${new Date(event.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    fireMultiModalAlert({
      title: `📅 ${event.title}`,
      body,
      tag: firedKey,
    });

    appendToNotificationDrawer({
      title: event.title,
      message: body,
      type: 'reminder',
    });

    markAsFired(firedKey);
    fired++;
  }

  return fired;
}

// ---------- Combined check ----------
export async function checkAllReminders() {
  const taskCount = await checkTaskReminders();
  const eventCount = await checkEventReminders();
  return taskCount + eventCount;
}

// ---------- Public helpers for the settings page ----------

// Fire a test alert using current prefs (so users can verify it works)
export function fireTestAlert() {
  fireMultiModalAlert({
    title: '⏰ Test reminder',
    body: 'This is how your notifications will look and sound.',
    tag: 'test-alert',
  });

  // Also drop it in the drawer
  appendToNotificationDrawer({
    title: 'Test reminder',
    message: 'This is a test notification from Settings.',
    type: 'info',
  });
}

// Speak a one-off phrase (for testing voice)
export function testVoice(text = 'UniTasker voice alerts are enabled') {
  speakReminder(text);
}

// Play the alert chime (for testing sound)
export function testSound() {
  playAlertSound();
}

// Trigger a vibration (for testing)
export function testVibration() {
  vibrate();
}

// Expose internal access for testing
export function getSupportedModes() {
  return {
    visual: typeof Notification !== 'undefined',
    sound: typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined',
    voice: 'speechSynthesis' in window,
    vibrate: 'vibrate' in navigator,
  };
}