import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { ProfileMenu } from './ProfileMenu';
import { AddArticleModal } from './AddArticleModal';
import { Link, useLocation } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus } from 'lucide-react';
import { Article } from '../types';
import ZENON from '../assets/ZENON.webp';

interface HeaderProps {
  isEditMode?: boolean;
  onAddArticle?: (article: Partial<Article>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isEditMode,
  onAddArticle,
}) => {
  const location = useLocation();
  const isTrashPage = location.pathname === '/trash';
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="relative -mx-4 sm:-mx-8 md:-mx-14 lg:-mx-20 mb-8 overflow-x-hidden">
      <div className="bg-zenon-light-card dark:bg-zenon-dark-card shadow-sm rounded-zenon px-4 sm:px-8 md:px-12 lg:px-16 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <img 
              src={ZENON} 
              alt="ZENON" 
              className="h-8 sm:h-10 lg:h-12 logo-shadow"
            />
            <h1 className="text-lg sm:text-xl font-medium">
              {isEditMode ? 'Production Editor' : isTrashPage ? 'Trash' : 'Scientific Watch'}
            </h1>
          </div>

          <div className="flex items-center flex-wrap justify-center sm:justify-end gap-2 sm:gap-4">
            {!isTrashPage && !isEditMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zenon-primary text-white rounded-zenon hover:bg-zenon-primary/90 transition-colors whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Article</span>
              </button>
            )}
            {isTrashPage ? (
              <Link
                to="/"
                className="px-3 sm:px-4 py-2 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon hover:bg-zenon-primary/10 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <ArrowLeft size={16} />
                Back to Articles
              </Link>
            ) : (
              <Link
                to="/trash"
                className="px-3 sm:px-4 py-2 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon hover:bg-zenon-primary/10 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 size={16} />
                Trash
              </Link>
            )}
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddArticleModal
          onClose={() => setShowAddModal(false)}
          onAdd={(article) => {
            onAddArticle?.(article);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};