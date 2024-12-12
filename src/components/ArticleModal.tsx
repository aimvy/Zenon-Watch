import React, { useEffect, useState } from 'react';
import { X, Tag, Calendar, Trash2 } from 'lucide-react';
import { Article } from '../types';
import { sanitizeHTML } from '../utils/sanitize';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onDelete: (id: string) => void;
  triggerRect: DOMRect;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, onDelete, triggerRect }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.body.offsetHeight;
    setMounted(true);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 500);
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
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(calc(100vw-2rem),800px)] bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon shadow-xl border border-zenon-primary/10 overflow-y-auto scrollbar-hide max-h-[calc(100vh-2rem)] transition-all duration-700 ease-in-out ${
          mounted && !isClosing 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-zenon-light-text dark:text-zenon-dark-text pr-8">
              {article.title}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this article?')) {
                    onDelete(article.id);
                    handleClose();
                  }
                }}
                className="p-2 hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg rounded-full text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-red-500 transition-all"
                title="Delete article"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-zenon-light-bg dark:hover:bg-zenon-dark-bg rounded-full text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-zenon-primary transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="flex-shrink-0" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={14} className="flex-shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {article.tags?.map((tag, index) => (
                    <div
                      key={index}
                      className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-600 dark:text-red-400"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div 
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.summary) }}
          />
        </div>
      </div>
    </div>
  );
};
