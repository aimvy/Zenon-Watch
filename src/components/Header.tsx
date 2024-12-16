import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import ProfileMenu from './ProfileMenu';
import { AddArticleModal } from './AddArticleModal';
import { Link, useLocation } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Eye, EyeOff } from 'lucide-react';
import { Article } from '../types';
import ZENON from '../assets/ZENON.webp';
import { useBackground } from '../contexts/BackgroundContext';
import '../styles/appear.css';

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
  const { showAnimation, toggleAnimation } = useBackground();

  return (
    <div className="header-appear sticky top-0 z-50 -mx-4 sm:-mx-8 md:-mx-14 lg:-mx-20 mb-8">
      <div className="header-bg zenon-shadow rounded-zenon px-4 sm:px-8 md:px-12 lg:px-16 py-6">
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

          <div className="flex items-center flex-wrap justify-center sm:justify-end gap-2 sm:gap-4 controls-appear">
            {!isTrashPage && !isEditMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zenon-primary text-white rounded-zenon hover:bg-zenon-primary/90 transition-colors whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Article</span>
              </button>
            )}
            {!isTrashPage ? (
              <Link
                to="/trash"
                className="px-3 sm:px-4 py-2 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon hover:bg-gray-100 dark:hover:bg-zenon-light-bg/10 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 size={16} />
                Trash
              </Link>
            ) : (
              <Link
                to="/"
                className="px-3 sm:px-4 py-2 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon hover:bg-gray-100 dark:hover:bg-zenon-light-bg/10 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <ArrowLeft size={16} />
                Back to Articles
              </Link>
            )}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleAnimation}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative group"
                title="Toggle animation"
              >
                {showAnimation ? (
                  <Eye className="w-5 h-5 text-zenon-light-text dark:text-zenon-dark-text" />
                ) : (
                  <EyeOff className="w-5 h-5 text-zenon-light-text dark:text-zenon-dark-text" />
                )}
                <span className="absolute hidden group-hover:block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-2 py-1 rounded-md -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Change animation theme in settings
                </span>
              </button>
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