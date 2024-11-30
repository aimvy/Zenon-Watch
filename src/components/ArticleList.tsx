import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ArticleCard } from './ArticleCard';
import { Article } from '../types';
import { ArrowUpDown } from 'lucide-react';

interface ArticleListProps {
  articles: Article[];
  onReorder?: (startIndex: number, endIndex: number) => void;
  showSelect?: boolean;
  isSelected?: (article: Article) => boolean;
  onSelect?: (article: Article) => void;
  isEditMode?: boolean;
  onEdit?: (id: string, field: keyof Article, value: string) => void;
  onSortByPriority?: () => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onReorder,
  showSelect,
  isSelected,
  onSelect,
  isEditMode,
  onEdit,
  onSortByPriority,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    onReorder?.(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="articles">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {onSortByPriority && articles.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={onSortByPriority}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zenon-light-text/70 dark:text-zenon-dark-text/70 hover:text-zenon-primary transition-colors bg-zenon-light-card/90 dark:bg-zenon-dark-card/95 rounded-zenon shadow-sm"
                >
                  <ArrowUpDown size={16} />
                  <span>Sort by Priority</span>
                </button>
              </div>
            )}
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                showSelect={showSelect}
                isSelected={isSelected?.(article)}
                onSelect={onSelect}
                isEditMode={isEditMode}
                onEdit={onEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};