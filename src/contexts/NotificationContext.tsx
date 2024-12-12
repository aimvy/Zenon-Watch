import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotificationContextType {
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showNotification = useCallback((newMessage: string) => {
    setMessage(newMessage);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {isVisible && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-white/95 dark:bg-zenon-dark-bg/95 backdrop-blur-sm border-2 border-zenon-primary rounded-lg shadow-lg shadow-zenon-primary/20 p-5 max-w-md mx-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-1 h-12 bg-zenon-primary rounded-full animate-pulse" />
              <p className="text-zenon-dark dark:text-zenon-light text-base font-medium">
                {message}
              </p>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
