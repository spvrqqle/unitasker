import { useState, useEffect, useCallback } from 'react';
import { 
  getAllResources, 
  createResourceFromHandle,
  createResourceFromFile,
  deleteResource,
  openResource as openResourceService,
  pickFile,
  isFileSystemAccessSupported,
} from '../services/resource.service';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [fileSystemSupported] = useState(isFileSystemAccessSupported());

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loaded = await getAllResources();
      // Sort by uploadedAt (most recent first)
      const sorted = (loaded || []).sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );
      setResources(sorted);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Add resource using File System Access API
  const addResourceWithPicker = useCallback(async () => {
    try {
      setError(null);
      const { fileHandle, file } = await pickFile();
      const newResource = await createResourceFromHandle(fileHandle, file);
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      // User cancelled the picker
      if (err.name === 'AbortError') {
        return null;
      }
      setError(err.message);
      throw err;
    }
  }, []);

  // Add resource via standard file input (fallback)
  const addResourceWithFile = useCallback(async (file) => {
    try {
      setError(null);
      const newResource = await createResourceFromFile(file);
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Open a resource
  const openResource = useCallback(async (resource) => {
    try {
      setOpeningId(resource.id);
      setError(null);
      await openResourceService(resource);
      // Update lastAccessed in the local state
      setResources(prev => prev.map(r => 
        r.id === resource.id 
          ? { ...r, lastAccessed: new Date().toISOString() }
          : r
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setOpeningId(null);
    }
  }, []);

  // Delete a resource
  const removeResource = useCallback(async (id) => {
    try {
      setError(null);
      await deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Refresh
  const refreshResources = useCallback(() => {
    loadResources();
  }, [loadResources]);

  return {
    resources: resources || [],
    loading,
    error,
    openingId,
    fileSystemSupported,
    addResourceWithPicker,
    addResourceWithFile,
    openResource,
    removeResource,
    refreshResources,
    setError,
  };
}