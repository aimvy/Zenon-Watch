import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleFilters } from '../components/ArticleFilters';
import { useArticles } from '../hooks/useArticles';
import { Article } from '../types';

type SortOption = 'priority' | 'date' | 'upvotes';

export const ArticlesPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('priority');
  
  const {
    articles,
    loading,
    error,
    selectedArticleIds,
    userUpvotes,
    handleUpvote,
    handleSelect,
    handlePositionUpdate,
  } = useArticles(selectedTag, sortOption);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    handlePositionUpdate(result.draggableId, sourceIndex, destinationIndex);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <ArticleFilters
          selectedTag={selectedTag}
          currentSort={sortOption}
          onTagSelect={setSelectedTag}
          onSortChange={setSortOption}
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="articles">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {articles.map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={index}
                    showSelect={true}
                    isSelected={selectedArticleIds.includes(article.id)}
                    onSelect={handleSelect}
                    onUpvote={handleUpvote}
                    hasUserUpvoted={userUpvotes.includes(article.id)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
