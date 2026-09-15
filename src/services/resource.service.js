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

// Check if File System Access API is supported
export function isFileSystemAccessSupported() {
  return 'showOpenFilePicker' in window && 'FileSystemFileHandle' in window;
}

// Open file picker and return the file handle + metadata
export async function pickFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported');
  }

  const [fileHandle] = await window.showOpenFilePicker({
    multiple: false,
  });

  const file = await fileHandle.getFile();
  return {
    fileHandle,
    file,
  };
}

// Create a new resource from a file handle
export async function createResourceFromHandle(fileHandle, file) {
  const resource = {
    id: generateId(),
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    filePath: file.name,
    fileHandle: fileHandle,  // IndexedDB can store FileSystemFileHandle directly
    uploadedAt: new Date().toISOString(),
    lastAccessed: null,
    metadata: {
      lastModified: file.lastModified,
    },
  };
  
  await addRecord(STORE_NAME, resource);
  return resource;
}

// Create a resource from a regular file (fallback for unsupported browsers)
export async function createResourceFromFile(file) {
  const resource = {
    id: generateId(),
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    filePath: file.name,
    fileHandle: null,  // No handle in fallback mode
    uploadedAt: new Date().toISOString(),
    lastAccessed: null,
    metadata: {
      lastModified: file.lastModified,
    },
  };
  
  await addRecord(STORE_NAME, resource);
  return resource;
}

// Get all resources
export async function getAllResources() {
  return getAllRecords(STORE_NAME);
}

// Get a resource by ID
export async function getResource(id) {
  return getRecord(STORE_NAME, id);
}

// Update a resource
export async function updateResource(id, updates) {
  const resource = await getResource(id);
  if (!resource) throw new Error(`Resource with id ${id} not found`);
  
  const updatedResource = {
    ...resource,
    ...updates,
  };
  
  await updateRecord(STORE_NAME, updatedResource);
  return updatedResource;
}

// Update the lastAccessed timestamp
export async function updateLastAccessed(id) {
  const resource = await getResource(id);
  if (resource) {
    resource.lastAccessed = new Date().toISOString();
    await updateRecord(STORE_NAME, resource);
  }
}

// Delete a resource
export async function deleteResource(id) {
  await deleteRecord(STORE_NAME, id);
}

// Open a file from its resource record
export async function openResource(resource) {
  // Update last accessed time
  await updateLastAccessed(resource.id);

  if (resource.fileHandle) {
    // Use File System Access API
    try {
      // Check permission
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
      
      // Clean up the URL after a delay
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
  } else {
    // Fallback: prompt user to re-select the file
    throw new Error('This resource was added without a file handle. Please re-upload the file.');
  }
}

// Format file size for display
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get an icon for a file type
export function getFileIcon(type) {
  if (!type) return '📎';
  
  const iconMap = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.ms-powerpoint': '📽️',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
    'application/zip': '🗜️',
    'application/x-zip-compressed': '🗜️',
    'application/json': '📋',
    'text/plain': '📃',
    'text/csv': '📊',
    'text/html': '🌐',
    'text/css': '🎨',
    'text/javascript': '⚙️',
  };

  if (iconMap[type]) return iconMap[type];

  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.startsWith('text/')) return '📃';

  return '📎';
}

// Group resources by category
export function getFileCategory(type) {
  if (!type) return 'other';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word') || type.includes('document')) return 'document';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return 'spreadsheet';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
  if (type.includes('zip') || type.includes('compressed')) return 'archive';
  return 'other';
}