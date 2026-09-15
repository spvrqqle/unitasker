import React, { createContext, useContext } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const timer = usePomodoro();
  return (
    <TimerContext.Provider value={timer}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};