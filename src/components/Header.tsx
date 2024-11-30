import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { ProfileMenu } from './ProfileMenu';
import ZENON from '../assets/ZENON.webp';
import { ChevronDown, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  showBulkSelect?: boolean;
  onBulkSelect?: (count: number) => void;
  onPublish?: () => void;
  selectedCount?: number;
  isEditMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  showBulkSelect,
  onBulkSelect,
  onPublish,
  selectedCount = 0,
  isEditMode,
}) => (
  <div className="relative -mx-24 mb-8">
    <div className="bg-zenon-light-card dark:bg-zenon-dark-card shadow-sm rounded-zenon px-16 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img 
            src={ZENON} 
            alt="ZENON" 
            className="h-12 logo-shadow"
          />
          <h1 className="text-xl font-medium">
            {isEditMode ? 'Production Editor' : 'Scientific Watch'}
          </h1>
        </div>
        
        {showBulkSelect && (
          <div className="flex-1 flex justify-center items-center gap-3 mx-12">
            <span className="text-sm text-zenon-light-text dark:text-zenon-dark-text">Select the first</span>
            <input
              type="number"
              min="0"
              value={selectedCount}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                onBulkSelect?.(value);
              }}
              className="w-20 px-3 py-2 text-sm bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary"
            />
            <span className="text-sm text-zenon-light-text dark:text-zenon-dark-text">articles</span>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {onPublish && !isEditMode && (
            <button
              onClick={onPublish}
              disabled={selectedCount === 0}
              className={`px-6 py-2.5 rounded-zenon transition-colors min-w-[120px] text-center ${
                selectedCount > 0
                  ? 'bg-zenon-primary text-white hover:bg-zenon-primary-dark'
                  : 'bg-zenon-light-border/50 dark:bg-zenon-dark-border/50 text-zenon-light-text/50 dark:text-zenon-dark-text/50 cursor-not-allowed'
              }`}
            >
              {selectedCount > 0 ? (
                <>
                  Publish {selectedCount > 1 && `(${selectedCount})`}
                </>
              ) : (
                'Publish'
              )}
            </button>
          )}
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </div>
  </div>
);