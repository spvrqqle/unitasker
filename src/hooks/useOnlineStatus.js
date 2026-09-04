import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  // Initialize with navigator.onLine
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Handle online event
    const handleOnline = () => {
      console.log('🟢 App is online');
      setIsOnline(true);
    };

    // Handle offline event
    const handleOffline = () => {
      console.log('🔴 App is offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try to fetch a small resource to check connectivity
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/favicon.png', { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (response.ok && !isOnline) {
          console.log('🟢 Connectivity restored (fetch check)');
          setIsOnline(true);
        } else if (!response.ok && isOnline) {
          console.log('🔴 Connectivity lost (fetch check)');
          setIsOnline(false);
        }
      } catch (error) {
        if (isOnline) {
          console.log('🔴 Connectivity lost (fetch error)');
          setIsOnline(false);
        }
      }
    };

    // Check connectivity every 5 seconds
    const interval = setInterval(() => {
      checkConnectivity();
    }, 5000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return isOnline;
};