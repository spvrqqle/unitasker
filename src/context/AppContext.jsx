import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB } from '../services/database';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [isDBReady, setIsDBReady] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        await getDB();
        setIsDBReady(true);
        setAppLoading(false);
        console.log('✅ IndexedDB initialized successfully');
      } catch (err) {
        setError(err.message);
        setAppLoading(false);
        console.error('❌ Failed to initialize IndexedDB:', err);
      }
    };

    initDB();
  }, []);

  return (
    <AppContext.Provider value={{ isDBReady, appLoading, error }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};