import React, { useRef, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Tag, Calendar, FileText, Minimize2, ArrowUpDown, ThumbsUp } from 'lucide-react';
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
  onDelete?: (id: string) => void;
  onUpvote?: (id: string) => void;
  hasUserUpvoted?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  index,
  showSelect,
  isSelected,
  onSelect,
  isEditMode,
  onEdit,
  onDelete,
  onUpvote,
  hasUserUpvoted,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTriggerRect, setModalTriggerRect] = useState<DOMRect | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const MAX_CHARS = 1200/*  */;

  const wordCount = article.summary.trim().split(/\s+/).length;

  const handleReduceText = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement webhook call to Make automation
    console.log('Reducing text for article:', article.id);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Ne pas ouvrir la carte si on clique sur certains éléments
    const target = event.target as Element;
    const clickedElement = target.closest('button, input[type="checkbox"], .select-area, label, [data-drag-handle], textarea, a, [data-no-expand]');
    
    if (isEditMode || clickedElement) {
      return;
    }

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setModalTriggerRect(rect);
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
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="mb-4"
          >
            <div
              ref={cardRef}
              onClick={!snapshot.isDragging ? handleCardClick : undefined}
              className={`relative bg-zenon-light-card/90 dark:bg-zenon-dark-card/95 p-6 rounded-zenon transition-all shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.15)] cursor-pointer hover:shadow-lg ${
                snapshot.isDragging ? 'shadow-lg ring-2 ring-zenon-primary/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4 w-full relative">
                <div className="flex-grow">
                  <div className="flex flex-wrap gap-1.5 mb-3 pointer-events-auto">
                    <div className="flex items-center gap-2 text-zenon-light-text/60 dark:text-zenon-dark-text/60 mr-1">
                      <Tag size={14} className="flex-shrink-0" />
                    </div>
                    {article.tags?.map((tag, index) => (
                      <div
                        key={index}
                        className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-600 dark:text-red-400"
                      >
                        {tag}
                      </div>
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
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <a
                        href={article.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className="text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-zenon-primary transition-colors"
                      >
                        Source
                      </a>
                      {article.additionalSources?.map((source, index) => (
                        <React.Fragment key={source}>
                          <span className="text-zenon-light-text/30 dark:text-zenon-dark-text/30">•</span>
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className="text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-zenon-primary transition-colors"
                          >
                            Source {index + 2}
                          </a>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                <div 
                  {...provided.dragHandleProps}
                  className="absolute right-0 top-1/2 -translate-y-1/2 ml-4 cursor-grab active:cursor-grabbing p-2"
                >
                  <GripVertical className="w-8 h-8 text-zenon-light-text/50 dark:text-zenon-dark-text/50" />
                </div>
                <div className="flex items-center gap-4">
                  {showSelect && (
                    <div className="select-area" data-no-expand>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpvote?.(article.id);
                    }}
                    data-no-expand
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-zenon transition-colors ${
                      hasUserUpvoted
                        ? 'bg-zenon-primary text-white'
                        : 'bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50 text-zenon-light-text/70 dark:text-zenon-dark-text/70 hover:bg-zenon-primary/10'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span>{article.upvotes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {showModal && modalTriggerRect && (
        <ArticleModal
          article={article}
          onClose={() => {
            setShowModal(false);
            setModalTriggerRect(null);
          }}
          onDelete={onDelete!}
          triggerRect={modalTriggerRect}
        />
      )}
    </>
  );
};