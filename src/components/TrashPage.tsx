import React, { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import { Article } from '../types';
import { Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrashPage: React.FC = () => {
  const { deletedArticles, restoreArticle, loading, error } = useArticles();
  const [restoringIds, setRestoringIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const handleRestore = async (articleId: string) => {
    try {
      setRestoringIds(prev => new Set([...prev, articleId]));
      await restoreArticle(articleId);
    } finally {
      setRestoringIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zenon-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-zenon-light-text dark:text-zenon-dark-text">
        Deleted Articles ({deletedArticles.length})
      </h2>
      {deletedArticles.length === 0 ? (
        <div className="text-center py-8 text-zenon-light-text/70 dark:text-zenon-dark-text/70">
          No deleted articles
        </div>
      ) : (
        deletedArticles.map((article: Article) => (
          <div
            key={article.id}
            className="bg-zenon-light-card/90 dark:bg-zenon-dark-card/95 p-6 rounded-zenon shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-medium text-zenon-light-text dark:text-zenon-dark-text mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-zenon-light-text/70 dark:text-zenon-dark-text/70">
                  {article.summary}
                </p>
                <div className="mt-2 text-xs text-zenon-light-text/50 dark:text-zenon-dark-text/50">
                  Deleted at: {new Date(article.deleted_at!).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleRestore(article.id)}
                disabled={restoringIds.has(article.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                  restoringIds.has(article.id)
                    ? 'bg-zenon-primary/5 cursor-not-allowed'
                    : 'bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50 hover:bg-zenon-primary/10'
                } text-zenon-primary rounded-zenon transition-colors`}
              >
                <Undo2 size={16} className={restoringIds.has(article.id) ? 'animate-spin' : ''} />
                {restoringIds.has(article.id) ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TrashPage;
