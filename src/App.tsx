import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArticleList } from './components/ArticleList';
import { useArticles } from './hooks/useArticles';
import { useMouseGradient } from './hooks/useMouseGradient';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Environment variables loaded:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function MainApp() {
  const {
    articles: initialArticles,
    selectedArticles,
    toggleArticleSelection,
    moveArticle,
    handleBulkSelect,
    updateArticle,
    loading,
    error
  } = useArticles();

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableArticles, setEditableArticles] = useState(initialArticles);
  const [selectedCount, setSelectedCount] = useState(selectedArticles.size);

  useMouseGradient();

  useEffect(() => {
    setEditableArticles(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    setSelectedCount(selectedArticles.size);
  }, [selectedArticles]);

  useEffect(() => {
    console.log('Articles loaded:', initialArticles.length);
    if (error) {
      console.error('Articles error:', error);
    }
  }, [initialArticles, error]);

  const handlePublish = () => {
    const selectedArticlesList = editableArticles.filter(article => 
      selectedArticles.has(article.id)
    );
    setEditableArticles(initialArticles.map(article => 
      selectedArticles.has(article.id) ? selectedArticlesList.find(a => a.id === article.id)! : article
    ));
    console.log('Publishing articles:', selectedArticlesList);
    setIsEditMode(true);
  };

  const handleEdit = async (id: string, field: keyof Article, value: string) => {
    try {
      setEditableArticles(prev => prev.map(article => 
        article.id === id ? { ...article, [field]: value } : article
      ));
      await updateArticle(id, { [field]: value });
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const handleSortByPriority = async () => {
    try {
      // TODO: Implement webhook call
      console.log('Sorting articles by priority...');
      // You can add your Make.com webhook URL here later
    } catch (error) {
      console.error('Error sorting articles:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zenon-light-bg dark:bg-zenon-dark-bg flex items-center justify-center">
        <div className="text-zenon-light-text dark:text-zenon-dark-text">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zenon-light-bg dark:bg-zenon-dark-bg flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400">
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (isEditMode) {
    const selectedArticlesList = editableArticles.filter(article => selectedArticles.has(article.id));
    
    return (
      <div className="min-h-screen bg-zenon-light-bg dark:bg-zenon-dark-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Header 
            isEditMode={true}
          />
          <div className="mt-8 mb-6">
            <button
              onClick={() => setIsEditMode(false)}
              className="text-sm text-zenon-light-text/70 dark:text-zenon-dark-text/70 hover:text-zenon-primary transition-colors flex items-center gap-2 rounded-zenon px-4 py-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Selection
            </button>
          </div>
          <ArticleList
            articles={selectedArticlesList}
            onReorder={moveArticle}
            isEditMode
            onEdit={handleEdit}
            onSortByPriority={handleSortByPriority}
          />
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-2.5 bg-zenon-primary text-white rounded-zenon hover:bg-zenon-primary-dark transition-colors"
            >
              Validate Production
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zenon-light-bg dark:bg-zenon-dark-bg">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Header
          showBulkSelect={!isEditMode}
          onBulkSelect={handleBulkSelect}
          onPublish={handlePublish}
          selectedCount={selectedCount}
          isEditMode={isEditMode}
        />
        <ArticleList
          articles={editableArticles}
          onReorder={moveArticle}
          showSelect
          isSelected={(article) => selectedArticles.has(article.id)}
          onSelect={toggleArticleSelection}
          onSortByPriority={handleSortByPriority}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SessionContextProvider supabaseClient={supabase}>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  );
}

export default App;