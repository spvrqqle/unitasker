import { 
  getAllRecords, 
  addRecord, 
  clearStore, 
  getDB,
} from './database';

// List of all data stores we back up
const DATA_STORES = ['tasks', 'notes', 'events', 'resources', 'timerSessions'];

// Settings stored in localStorage (not IndexedDB)
const LOCAL_SETTINGS_KEYS = [
  'unitaser-theme',
  'unitaser_pomodoro_settings',
  'unitaser_timer_state',
  'unitaser_notifications',
  'unitaser_auto_breaks',
];

const APP_VERSION = '1.0.0';
const EXPORT_FORMAT_VERSION = 1;

// ---------- Export ----------

export async function exportAllData() {
  const data = {};

  for (const store of DATA_STORES) {
    try {
      const records = await getAllRecords(store);
      data[store] = records || [];
    } catch (err) {
      console.warn(`Failed to export ${store}:`, err);
      data[store] = [];
    }
  }

  // Collect localStorage settings
  const settings = {};
  for (const key of LOCAL_SETTINGS_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      settings[key] = value;
    }
  }

  // Compute stats
  const stats = {
    tasks: data.tasks.length,
    notes: data.notes.length,
    events: data.events.length,
    resources: data.resources.length,
    timerSessions: data.timerSessions.length,
  };

  return {
    _meta: {
      app: 'UniTasker',
      version: APP_VERSION,
      exportFormatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      stats,
    },
    data,
    settings,
  };
}

export function downloadJSON(json, filename) {
  const blob = new Blob([JSON.stringify(json, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateExportFilename() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `unitasker-backup-${yyyy}${mm}${dd}-${hh}${min}.json`;
}

// ---------- Import ----------

export function validateImportFile(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'File is not a valid JSON object.' };
  }
  if (!parsed._meta) {
    return { valid: false, error: 'Missing _meta section — this may not be a UniTasker backup.' };
  }
  if (parsed._meta.app !== 'UniTasker') {
    return { valid: false, error: `This file is from "${parsed._meta.app}", not UniTasker.` };
  }
  if (!parsed.data) {
    return { valid: false, error: 'Missing data section in backup file.' };
  }
  return { valid: true };
}

export async function importAllData(parsed) {
  const validation = validateImportFile(parsed);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 1. Wipe all data stores
  for (const store of DATA_STORES) {
    try {
      await clearStore(store);
    } catch (err) {
      console.warn(`Failed to clear ${store}:`, err);
    }
  }

  // 2. Restore data into IndexedDB
  const restored = {};
  for (const store of DATA_STORES) {
    const records = parsed.data[store] || [];
    let count = 0;
    for (const record of records) {
      try {
        await addRecord(store, record);
        count++;
      } catch (err) {
        console.warn(`Failed to restore record in ${store}:`, err);
      }
    }
    restored[store] = count;
  }

  // 3. Restore localStorage settings
  if (parsed.settings) {
    for (const key of LOCAL_SETTINGS_KEYS) {
      if (parsed.settings[key] !== undefined) {
        try {
          localStorage.setItem(key, parsed.settings[key]);
        } catch (err) {
          console.warn(`Failed to restore setting ${key}:`, err);
        }
      }
    }
  }

  return restored;
}

// ---------- Clear all data ----------

export async function clearAllData() {
  for (const store of DATA_STORES) {
    try {
      await clearStore(store);
    } catch (err) {
      console.warn(`Failed to clear ${store}:`, err);
    }
  }
  // Also clear localStorage settings
  for (const key of LOCAL_SETTINGS_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Failed to remove setting ${key}:`, err);
    }
  }
}

// ---------- Statistics ----------

export async function getDataStatistics() {
  const stats = {
    tasks: 0,
    notes: 0,
    events: 0,
    resources: 0,
    timerSessions: 0,
  };

  for (const store of DATA_STORES) {
    try {
      const records = await getAllRecords(store);
      stats[store] = records ? records.length : 0;
    } catch (err) {
      console.warn(`Failed to count ${store}:`, err);
    }
  }

  // Estimate storage size (rough)
  let estimatedBytes = 0;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      estimatedBytes = estimate.usage || 0;
    }
  } catch (err) {
    console.warn('Storage estimate not available:', err);
  }

  return {
    ...stats,
    estimatedBytes,
  };
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export { APP_VERSION };