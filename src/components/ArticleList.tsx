import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ArticleCard } from './ArticleCard';
import { ArticleFilters } from './ArticleFilters';
import { Article } from '../types';
import { ArrowUpDown } from 'lucide-react';

type SortOption = 'priority' | 'date' | 'upvotes';

interface ArticleListProps {
  articles: Article[];
  onReorder?: (startIndex: number, endIndex: number) => void;
  showSelect?: boolean;
  isSelected?: (article: Article) => boolean;
  onSelect?: (article: Article) => void;
  isEditMode?: boolean;
  onEdit?: (id: string, field: keyof Article, value: string) => void;
  onDelete?: (id: string) => void;
  onUpvote?: (id: string) => void;
  hasUserUpvoted?: (id: string) => boolean;
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onReorder,
  showSelect,
  isSelected,
  onSelect,
  isEditMode,
  onEdit,
  onDelete,
  onUpvote,
  hasUserUpvoted,
  currentSort,
  onSortChange,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [localArticles, setLocalArticles] = useState(articles);
  const [sortCounter, setSortCounter] = useState(0);

  // Mettre à jour localArticles quand les articles changent ou quand le tri change
  useEffect(() => {
    let filtered = articles;
    if (selectedTags.length > 0) {
      filtered = articles.filter(article => 
        article.tags && 
        Array.isArray(article.tags) && 
        selectedTags.every(tag => article.tags.includes(tag))
      );
    }

    // Appliquer le tri
    const sorted = [...filtered].sort((a, b) => {
      switch (currentSort) {
        case 'date':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        case 'upvotes':
          return (b.upvotes || 0) - (a.upvotes || 0);
        case 'priority':
        default:
          return a.position - b.position;
      }
    });

    setLocalArticles(sorted);
  }, [articles, currentSort, selectedTags, sortCounter]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // Mettre à jour uniquement l'ordre local
    const items = Array.from(localArticles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLocalArticles(items);
  };

  return (
    <div className="space-y-6">
      <ArticleFilters
        selectedTags={selectedTags}
        currentSort={currentSort}
        onTagSelect={setSelectedTags}
        onSortChange={(sort) => {
          // Incrémenter le compteur même si le mode de tri ne change pas
          setSortCounter(prev => prev + 1);
          onSortChange(sort);
        }}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="articles">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-8"
            >
              {localArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  showSelect={showSelect}
                  isSelected={isSelected?.(article)}
                  onSelect={() => onSelect?.(article)}
                  isEditMode={isEditMode}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpvote={onUpvote}
                  hasUserUpvoted={hasUserUpvoted?.(article.id)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};