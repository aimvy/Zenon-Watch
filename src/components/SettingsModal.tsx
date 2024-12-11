import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useBackground } from '../contexts/BackgroundContext';
import type { AnimationTheme } from '../contexts/BackgroundContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const animationThemes: { id: AnimationTheme; name: string; description: string }[] = [
  { 
    id: 'halos', 
    name: 'Halos', 
    description: 'Organic, flowing light effects that create a dynamic atmosphere'
  },
  { 
    id: 'strokes', 
    name: 'Strokes', 
    description: 'Minimalist lines that move across the screen in a geometric pattern'
  },
  { 
    id: 'beams', 
    name: 'Beams', 
    description: 'Radiant light beams that pulse and move through space'
  },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { animationTheme, setAnimationTheme, showAnimation, toggleAnimation } = useBackground();
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.offsetHeight;
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      setMounted(false);
      setIsClosing(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setMounted(false);
      setIsClosing(false);
    }, 500);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          mounted && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(calc(100vw-2rem),600px)] bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon shadow-xl border border-zenon-primary/10 overflow-y-auto scrollbar-hide max-h-[calc(100vh-2rem)] transition-all duration-700 ease-in-out ${
          mounted && !isClosing 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-zenon-light-text dark:text-zenon-dark-text">
              Settings
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg rounded-full text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-zenon-primary transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-zenon-light-text dark:text-zenon-dark-text mb-4">
                Background Animation
              </h3>
              <div className="flex items-center mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showAnimation}
                    onChange={toggleAnimation}
                  />
                  <div className="w-11 h-6 bg-zenon-light-border dark:bg-zenon-dark-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zenon-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zenon-light-border dark:after:border-zenon-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zenon-primary"></div>
                  <span className="ml-3 text-sm font-medium text-zenon-light-text dark:text-zenon-dark-text">
                    Enable Animation
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-zenon-light-text dark:text-zenon-dark-text mb-4">
                Animation Theme
              </h3>
              <div className="grid gap-3">
                {animationThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`relative flex items-start p-4 sm:p-5 cursor-pointer rounded-zenon border transition-all ${
                      animationTheme === theme.id
                        ? 'border-zenon-primary bg-zenon-primary/5 dark:bg-zenon-primary/10 shadow-lg shadow-zenon-primary/10'
                        : 'border-zenon-light-border dark:border-zenon-dark-border hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg hover:shadow-md'
                    }`}
                    onClick={() => setAnimationTheme(theme.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-base font-medium text-zenon-light-text dark:text-zenon-dark-text">
                          {theme.name}
                        </div>
                        {animationTheme === theme.id && (
                          <div className="h-2 w-2 rounded-full bg-zenon-primary" />
                        )}
                      </div>
                      <p className="text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60 mt-2">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
