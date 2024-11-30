import React, { useEffect, useState } from 'react';
import { X, Tag, Calendar } from 'lucide-react';
import { Article } from '../types';
import { sanitizeHTML } from '../utils/sanitize';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  triggerRect: DOMRect;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, triggerRect }) => {
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

  const modalStyle = {
    '--trigger-left': `${triggerRect.left}px`,
    '--trigger-top': `${triggerRect.top}px`,
    '--trigger-width': `${triggerRect.width}px`,
    '--trigger-height': `${triggerRect.height}px`,
  } as React.CSSProperties;

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
        className={`fixed bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon shadow-xl border border-zenon-primary/10 overflow-y-auto scrollbar-hide max-h-[calc(100vh-2rem)] transition-all duration-700 ease-in-out ${
          mounted && !isClosing ? 'modal-open' : 'modal-closed'
        }`}
        style={{
          ...modalStyle,
          '--expanded-width': `${triggerRect.width + 64}px`,
          '--center-offset': `${triggerRect.width / 2}px`,
        } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-zenon-light-text dark:text-zenon-dark-text pr-8">
              {article.title}
            </h2>
            <button
              onClick={handleClose}
              className="text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-zenon-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="flex-shrink-0" />
              <span>Published: {article.publishedAt}</span>
            </div>
            <span>Added: {article.createdAt}</span>
          </div>

          <div className="h-px bg-zenon-primary/10 mt-4" />

          <div className="flex items-start gap-4 mt-2">
            <div className="flex items-center gap-2 text-zenon-light-text/60 dark:text-zenon-dark-text/60 pt-0.5">
              <Tag size={16} className="flex-shrink-0" />
              <span className="text-sm">Tags</span>
            </div>
            <div className="flex-1 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-zenon-primary/10 text-zenon-primary text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-zenon-primary/10 mt-4" />

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-zenon-light-text dark:text-zenon-dark-text mb-3">
              Summary
            </h3>
            <div className="text-zenon-light-text/80 dark:text-zenon-dark-text/80 space-y-4 [&_a]:text-red-500 [&_a]:underline [&_a]:hover:text-red-600 [&_a]:transition-colors">
              {article.summary.split('\n\n').map((paragraph, index) => (
                <div
                  key={index}
                  className="text-base leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(paragraph.trim())
                  }}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-zenon-primary/10 mt-4" />

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-zenon-light-text dark:text-zenon-dark-text mb-3">
              Sources
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-zenon-light-text/60 dark:text-zenon-dark-text/60 mb-2">
                  Main Source
                </h4>
                <a
                  href={article.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zenon-primary hover:underline"
                >
                  {article.source}
                </a>
              </div>

              {article.additionalSources && article.additionalSources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-zenon-light-text/60 dark:text-zenon-dark-text/60 mb-2">
                    Additional Sources
                  </h4>
                  <div className="flex flex-col gap-2">
                    {article.additionalSources.map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zenon-primary hover:underline"
                      >
                        {source}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
