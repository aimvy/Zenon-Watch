import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-zenon transition-colors hover:bg-gray-100 dark:hover:bg-zenon-light-bg/10"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-zenon-dark-text" />
      ) : (
        <Moon className="w-5 h-5 text-zenon-light-text" />
      )}
    </button>
  );
};