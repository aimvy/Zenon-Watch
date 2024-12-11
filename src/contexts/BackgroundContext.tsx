import React, { createContext, useContext, useState } from 'react';

export type AnimationTheme = 'halos' | 'strokes' | 'beams';

interface BackgroundContextType {
  showAnimation: boolean;
  toggleAnimation: () => void;
  animationTheme: AnimationTheme;
  setAnimationTheme: (theme: AnimationTheme) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationTheme, setAnimationTheme] = useState<AnimationTheme>('halos');

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
