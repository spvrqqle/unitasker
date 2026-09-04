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

    // Check status periodically (fallback for some browsers)
    const interval = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        console.log(`🔄 Status changed from ${isOnline} to ${currentStatus}`);
        setIsOnline(currentStatus);
      }
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return isOnline;
};