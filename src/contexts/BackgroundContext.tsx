import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AnimationTheme } from '../animations';

interface BackgroundContextType {
  showAnimation: boolean;
  toggleAnimation: () => void;
  animationTheme: AnimationTheme;
  setAnimationTheme: (theme: AnimationTheme) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const STORAGE_KEY = 'zenon-background-preference';

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!hasVisited) {
      // Première visite : valeurs par défaut
      return {
        showAnimation: true,
        animationTheme: 'halos' as AnimationTheme
      };
    }
    
    // Visites suivantes : charger les préférences sauvegardées ou utiliser les valeurs par défaut
    return saved ? JSON.parse(saved) : {
      showAnimation: true,
      animationTheme: 'halos'
    };
  });

  // Sauvegarder les préférences à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const toggleAnimation = () => {
    setPreferences(prev => ({
      ...prev,
      showAnimation: !prev.showAnimation
    }));
  };

  const setAnimationTheme = (theme: AnimationTheme) => {
    setPreferences(prev => ({
      ...prev,
      animationTheme: theme
    }));
  };

  return (
    <BackgroundContext.Provider value={{ 
      showAnimation: preferences.showAnimation, 
      toggleAnimation, 
      animationTheme: preferences.animationTheme, 
      setAnimationTheme 
    }}>
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
