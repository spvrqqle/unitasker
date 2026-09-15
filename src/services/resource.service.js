import { 
  getDB, 
  addRecord, 
  getRecord, 
  getAllRecords, 
  updateRecord, 
  deleteRecord 
} from './database';

const STORE_NAME = 'resources';

// Generate a unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ---------- Capability detection ----------

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' &&
    'showOpenFilePicker' in window && 
    'FileSystemFileHandle' in window;
}

// ---------- File picker ----------

export async function pickFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported');
  }

  const [fileHandle] = await window.showOpenFilePicker({
    multiple: false,
  });

  const file = await fileHandle.getFile();
  return { fileHandle, file };
}

// ---------- Create resources ----------

// Create a file-type resource with a FileSystemFileHandle (Chrome/Edge)
export async function createFileResource(fileHandle, file) {
  const resource = {
    id: generateId(),
    kind: 'file',
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    filePath: file.name,
    fileHandle: fileHandle,
    url: null,
    description: '',
    uploadedAt: new Date().toISOString(),
    lastAccessed: null,
    metadata: {
      lastModified: file.lastModified,
    },
  };
  
  await addRecord(STORE_NAME, resource);
  return resource;
}

// Create a file-type resource without a handle (fallback browsers)
export async function createFileResourceFallback(file) {
  const resource = {
    id: generateId(),
    kind: 'file',
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    filePath: file.name,
    fileHandle: null,
    url: null,
    description: '',
    uploadedAt: new Date().toISOString(),
    lastAccessed: null,
    metadata: {
      lastModified: file.lastModified,
    },
  };
  
  await addRecord(STORE_NAME, resource);
  return resource;
}

// Create a link-type resource (URL, drive link, local path, etc.)
export async function createLinkResource({ name, url, description = '' }) {
  const resource = {
    id: generateId(),
    kind: 'link',
    name: name.trim(),
    type: 'link',
    size: 0,
    filePath: '',
    fileHandle: null,
    url: url.trim(),
    description: description.trim(),
    uploadedAt: new Date().toISOString(),
    lastAccessed: null,
    metadata: {},
  };
  
  await addRecord(STORE_NAME, resource);
  return resource;
}

// ---------- Read / Update / Delete ----------

export async function getAllResources() {
  return getAllRecords(STORE_NAME);
}

export async function getResource(id) {
  return getRecord(STORE_NAME, id);
}

export async function updateResource(id, updates) {
  const resource = await getResource(id);
  if (!resource) throw new Error(`Resource with id ${id} not found`);
  
  const updatedResource = { ...resource, ...updates };
  await updateRecord(STORE_NAME, updatedResource);
  return updatedResource;
}

export async function updateLastAccessed(id) {
  const resource = await getResource(id);
  if (resource) {
    resource.lastAccessed = new Date().toISOString();
    await updateRecord(STORE_NAME, resource);
  }
}

export async function deleteResource(id) {
  await deleteRecord(STORE_NAME, id);
}

// ---------- Open a resource ----------

export async function openResource(resource) {
  await updateLastAccessed(resource.id);

  // Link type: just open the URL
  if (resource.kind === 'link') {
    if (!resource.url) {
      throw new Error('This link is empty.');
    }
    // Prepend https:// if it looks like a bare domain
    let url = resource.url;
    if (!/^https?:\/\//i.test(url) && !/^[a-z]:\\/i.test(url) && !url.startsWith('/')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true };
  }

  // File type: use the handle
  if (!resource.fileHandle) {
    throw new Error(
      'This file was added without a handle. Please remove it and add it again using "Add File".'
    );
  }

  try {
    const permission = await resource.fileHandle.queryPermission({ mode: 'read' });
    if (permission !== 'granted') {
      const newPermission = await resource.fileHandle.requestPermission({ mode: 'read' });
      if (newPermission !== 'granted') {
        throw new Error('Permission denied to open file');
      }
    }

    const file = await resource.fileHandle.getFile();
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);

    return { success: true };
  } catch (err) {
    if (err.name === 'NotFoundError') {
      throw new Error('The file was moved or deleted from its original location.');
    }
    if (err.name === 'NotAllowedError') {
      throw new Error('Permission to access the file was denied.');
    }
    throw err;
  }
}

// ---------- Helpers ----------

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get a short type label for a resource
export function getTypeLabel(resource) {
  if (resource.kind === 'link') {
    if (!resource.url) return 'LINK';
    if (/drive\.google/i.test(resource.url)) return 'DRIVE';
    if (/onedrive|1drv\.ms/i.test(resource.url)) return '1DRIVE';
    if (/dropbox/i.test(resource.url)) return 'DROPBOX';
    if (/github/i.test(resource.url)) return 'GITHUB';
    if (/youtube|youtu\.be/i.test(resource.url)) return 'YOUTUBE';
    if (/^[a-z]:\\/i.test(resource.url)) return 'PATH';
    return 'LINK';
  }

  const name = (resource.name || '').toLowerCase();
  const ext = name.split('.').pop();
  if (ext && ext.length <= 5) return ext.toUpperCase();
  if (!resource.type) return 'FILE';
  if (resource.type === 'application/pdf') return 'PDF';
  if (resource.type.includes('word')) return 'DOC';
  if (resource.type.includes('excel')) return 'XLS';
  if (resource.type.includes('powerpoint')) return 'PPT';
  if (resource.type.startsWith('image/')) return 'IMG';
  if (resource.type.startsWith('video/')) return 'VIDEO';
  if (resource.type.startsWith('audio/')) return 'AUDIO';
  if (resource.type.includes('zip')) return 'ZIP';
  if (resource.type.startsWith('text/')) return 'TXT';
  return 'FILE';
}