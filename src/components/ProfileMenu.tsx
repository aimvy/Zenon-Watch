import React, { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { User2, LogOut, Settings, ChevronDown } from 'lucide-react';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-zenon hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg transition-colors sticky top-0"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <User2 className="w-5 h-5 text-zenon-light-text dark:text-zenon-dark-text" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          </div>
          <span className="text-sm text-zenon-light-text dark:text-zenon-dark-text hidden sm:inline-block">
            {user?.email?.split('@')[0]}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-zenon-light-text/70 dark:text-zenon-dark-text/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="absolute right-0 mt-2 w-72 rounded-zenon bg-zenon-light-card dark:bg-zenon-dark-card shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 transform opacity-100 scale-100 transition-all duration-200 ease-out origin-top-right"
          >
            <div className="p-4 border-b border-zenon-light-border dark:border-zenon-dark-border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-zenon-primary/10 dark:bg-zenon-primary/20 flex items-center justify-center">
                    <User2 className="w-5 h-5 text-zenon-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zenon-light-text dark:text-zenon-dark-text">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-zenon-light-text/60 dark:text-zenon-dark-text/60">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => {
                  console.log('Settings clicked');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-zenon-light-text dark:text-zenon-dark-text hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-zenon-light-text/70 dark:text-zenon-dark-text/70" />
                Settings
              </button>
              
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
