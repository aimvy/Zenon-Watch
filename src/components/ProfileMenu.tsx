import React, { useState, useRef, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { User2 } from 'lucide-react';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg transition-colors"
        aria-label="Profile menu"
      >
        <User2 className="w-6 h-6 text-zenon-light-text dark:text-zenon-dark-text" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-zenon-light-border dark:border-zenon-dark-border">
            <p className="text-sm font-medium text-zenon-light-text dark:text-zenon-dark-text truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-zenon-light-text dark:text-zenon-dark-text hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
