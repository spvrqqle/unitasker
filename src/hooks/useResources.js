import { useState, useEffect, useCallback } from 'react';
import { 
  getAllResources, 
  createFileResource,
  createFileResourceFallback,
  createLinkResource,
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

  // Add a file using File System Access API
  const addFileWithPicker = useCallback(async () => {
    try {
      setError(null);
      const { fileHandle, file } = await pickFile();
      const newResource = await createFileResource(fileHandle, file);
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message);
      throw err;
    }
  }, []);

  // Add a file via standard file input (fallback)
  const addFileFallback = useCallback(async (file) => {
    try {
      setError(null);
      const newResource = await createFileResourceFallback(file);
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Add a link
  const addLink = useCallback(async (linkData) => {
    try {
      setError(null);
      const newResource = await createLinkResource(linkData);
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

  // Delete
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

  const refreshResources = useCallback(() => {
    loadResources();
  }, [loadResources]);

  return {
    resources: resources || [],
    loading,
    error,
    openingId,
    fileSystemSupported,
    addFileWithPicker,
    addFileFallback,
    addLink,
    openResource,
    removeResource,
    refreshResources,
    setError,
  };
}