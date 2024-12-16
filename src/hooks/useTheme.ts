import { useState, useEffect } from 'react';

const THEME_KEY = 'zenon-theme-preference';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (!hasVisited) {
      localStorage.setItem('hasVisited', 'true');
      return true; // Mode sombre par défaut pour la première visite
    }
    
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle };
};