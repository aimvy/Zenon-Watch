import React, { createContext, useContext, useState } from 'react';

interface BackgroundContextType {
  showHalos: boolean;
  toggleHalos: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showHalos, setShowHalos] = useState(true);

  const toggleHalos = () => {
    setShowHalos(prev => !prev);
  };

  return (
    <BackgroundContext.Provider value={{ showHalos, toggleHalos }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
