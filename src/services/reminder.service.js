import { getAllTasks } from './task.service';
import { getAllRecords } from './database';

const NOTIFICATIONS_KEY = 'unitaser_notifications';
const FIRED_KEY = 'unitaser_fired_reminders';

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

export async function checkTaskReminders() {
  const now = Date.now();
  const firedIds = getFiredIds();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  console.log('🔍 [reminder] Starting check', {
    now: new Date(now).toLocaleString(),
    oneDayAgo: new Date(oneDayAgo).toLocaleString(),
    permission: Notification.permission,
    firedIds,
  });

  let tasks;
  try {
    tasks = await getAllTasks();
  } catch (err) {
    console.warn('Failed to load tasks for reminder check:', err);
    return 0;
  }

  console.log(`🔍 [reminder] Found ${tasks.length} tasks`);

  let fired = 0;

  for (const task of tasks || []) {
    if (!task.reminder) {
      console.log(`⏭️  [reminder] "${task.title}" — no reminder`);
      continue;
    }
    if (task.status === 'Completed') {
      console.log(`⏭️  [reminder] "${task.title}" — completed`);
      continue;
    }

    const reminderTime = new Date(task.reminder).getTime();

    console.log(`🔎 [reminder] Evaluating "${task.title}"`, {
      rawReminder: task.reminder,
      parsedTime: isNaN(reminderTime) ? 'INVALID' : new Date(reminderTime).toLocaleString(),
      isNaN: isNaN(reminderTime),
      isFuture: reminderTime > now,
      isTooOld: reminderTime < oneDayAgo,
      alreadyFired: firedIds.includes(`task-${task.id}`),
    });

    if (isNaN(reminderTime)) continue;
    if (reminderTime > now) continue;
    if (reminderTime < oneDayAgo) continue;

    const firedKey = `task-${task.id}`;
    if (firedIds.includes(firedKey)) continue;

    const body = task.dueDate
      ? `Due ${new Date(task.dueDate).toLocaleString()}`
      : 'Reminder from UniTasker';

    console.log(`🔔 [reminder] FIRING for "${task.title}"`);

    fireSystemNotification({
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

  console.log(`🔍 [reminder] Done. Fired: ${fired}`);
  return fired;
}

export async function checkEventReminders() {
  return 0; // Temporarily disabled for debugging
}

export async function checkAllReminders() {
  const taskCount = await checkTaskReminders();
  const eventCount = await checkEventReminders();
  return taskCount + eventCount;
}