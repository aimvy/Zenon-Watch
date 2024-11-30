import React, { useRef, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Tag, Calendar, FileText, Minimize2, ArrowUpDown } from 'lucide-react';
import { Article } from '../types';
import { ArticleModal } from './ArticleModal';
import { sanitizeHTML } from '../utils/sanitize';

interface ArticleCardProps {
  article: Article;
  index: number;
  showSelect?: boolean;
  isSelected?: boolean;
  onSelect?: (article: Article) => void;
  isEditMode?: boolean;
  onEdit?: (id: string, field: keyof Article, value: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  index,
  showSelect,
  isSelected,
  onSelect,
  isEditMode,
  onEdit,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const MAX_CHARS = 300;

  const wordCount = article.summary.trim().split(/\s+/).length;

  const handleReduceText = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement webhook call to Make automation
    console.log('Reducing text for article:', article.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (
      isEditMode ||
      e.target instanceof Element &&
      (e.target.closest('input[type="checkbox"]') ||
        e.target.closest('label') ||
        e.target.closest('[data-drag-handle]') ||
        e.target.closest('textarea') ||
        e.target.closest('a'))
    ) {
      return;
    }

    if (cardRef.current) {
      setTriggerRect(cardRef.current.getBoundingClientRect());
      setShowModal(true);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const truncateText = (text: string) => {
    if (text.length <= MAX_CHARS) return text;
    return text.slice(0, MAX_CHARS) + '...';
  };

  return (
    <>
      <Draggable draggableId={article.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="mb-4"
          >
            <div
              ref={cardRef}
              onClick={handleClick}
              className="relative bg-zenon-light-card/90 dark:bg-zenon-dark-card/95 p-6 rounded-zenon transition-all shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-start justify-between gap-4 w-full relative">
                <div className="flex-grow">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <div className="flex items-center gap-2 text-zenon-light-text/60 dark:text-zenon-dark-text/60 mr-1">
                      <Tag size={14} className="flex-shrink-0" />
                    </div>
                    {article.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-zenon-primary/10 text-zenon-primary text-xs px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {isEditMode ? (
                    <input
                      type="text"
                      value={article.title}
                      onChange={(e) => onEdit?.(article.id, 'title', e.target.value)}
                      className="w-full p-2 text-xl font-semibold bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-zenon-light-text dark:text-zenon-dark-text mb-3">
                      {article.title}
                    </h2>
                  )}

                  {isEditMode ? (
                    <div className="space-y-4">
                      <textarea
                        value={article.summary}
                        onChange={(e) => onEdit?.(article.id, 'summary', e.target.value)}
                        className="w-full min-h-[200px] p-4 text-sm bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary resize-y"
                      />
                      <div className="flex items-center justify-between text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="flex-shrink-0" />
                          <span>{wordCount} words</span>
                        </div>
                        <button
                          onClick={handleReduceText}
                          className="flex items-center gap-2 px-3 py-1.5 bg-zenon-primary/10 hover:bg-zenon-primary/20 text-zenon-primary rounded-zenon transition-colors"
                        >
                          <Minimize2 size={14} />
                          <span>Reduce</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-zenon-light-text/80 dark:text-zenon-dark-text/80 mb-4 space-y-4 [&_a]:text-red-500 [&_a]:underline [&_a]:hover:text-red-600 [&_a]:transition-colors">
                      {article.summary.split('\n\n').map((paragraph, index) => {
                        const displayText = !isExpanded ? truncateText(paragraph) : paragraph;
                        return (
                          <div
                            key={index}
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHTML(displayText.trim())
                            }}
                            onClick={handleLinkClick}
                          />
                        );
                      })}
                      {article.summary.length > MAX_CHARS && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                          }}
                          className="text-sm text-zenon-primary hover:text-zenon-primary/80 transition-colors"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span>Published: {article.publishedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {showSelect && (
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelect?.(article);
                        }}
                        className="appearance-none w-6 h-6 rounded-full border-2 border-zenon-primary cursor-pointer relative transition-colors
                        after:content-[''] after:w-2 after:h-2 after:rounded-full after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-white dark:after:bg-black after:opacity-0 checked:after:opacity-100 checked:bg-zenon-primary"
                      />
                    </div>
                  )}
                </div>
                <div {...provided.dragHandleProps} data-drag-handle className="absolute right-0 top-1/2 -translate-y-1/2 ml-4">
                  <GripVertical className="w-6 h-6 text-zenon-light-text/50 dark:text-zenon-dark-text/50" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {showModal && triggerRect && (
        <ArticleModal
          article={article}
          triggerRect={triggerRect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};