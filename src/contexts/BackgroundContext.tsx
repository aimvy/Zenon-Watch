import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AnimationTheme } from '../animations';

interface BackgroundContextType {
  showAnimation: boolean;
  toggleAnimation: () => void;
  animationTheme: AnimationTheme;
  setAnimationTheme: (theme: AnimationTheme) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const STORAGE_KEY = 'zenon-watch-background';

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Récupérer les préférences sauvegardées ou utiliser les valeurs par défaut
  const [showAnimation, setShowAnimation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.showAnimation ?? true;
    }
    return true;
  });

  const [animationTheme, setAnimationTheme] = useState<AnimationTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.animationTheme ?? 'halos';
    }
    return 'halos';
  });

  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      showAnimation,
      animationTheme
    }));
  }, [showAnimation, animationTheme]);

  const toggleAnimation = () => {
    setShowAnimation(!showAnimation);
  };

  return (
    <BackgroundContext.Provider value={{ 
      showAnimation, 
      toggleAnimation, 
      animationTheme, 
      setAnimationTheme 
    }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
