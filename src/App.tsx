import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArticleList } from './components/ArticleList';
import { useArticles } from './hooks/useArticles';
import { useMouseGradient } from './hooks/useMouseGradient';
import { ChevronLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Trash2 } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrashPage from './components/TrashPage';
import Background from './components/Background';
import { BackgroundProvider } from './contexts/BackgroundContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useNotification } from './contexts/NotificationContext';
import { getComingSoonMessage } from './utils/comingSoon';
import LoadingScreen from './components/LoadingScreen';

function MainApp() {
  const [sortOption, setSortOption] = useState<'priority' | 'date' | 'upvotes'>('priority');
  const {
    articles: initialArticles,
    selectedArticleIds,
    toggleArticleSelection,
    selectFirstN,
    isArticleSelected,
    moveArticle,
    updateArticle,
    deleteArticle,
    createArticle,
    handleUpvote,
    hasUserUpvoted,
    cleanBackslashesInDatabase,
    loading,
    error
  } = useArticles(null, sortOption);

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editableArticles, setEditableArticles] = useState(initialArticles);
  const [inputValue, setInputValue] = useState(0);

  const { showNotification } = useNotification();

  useMouseGradient();

  useEffect(() => {
    setEditableArticles(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    console.log('Articles loaded:', initialArticles.length);
    if (error) {
      console.error('Articles error:', error);
    }
  }, [initialArticles, error]);

  const handlePublish = () => {
    const selectedArticlesList = editableArticles.filter(article => 
      selectedArticleIds.includes(article.id)
    );
    setEditableArticles(initialArticles.map(article => 
      selectedArticleIds.includes(article.id) ? selectedArticlesList.find(a => a.id === article.id)! : article
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

  const handleSortChange = (option: 'priority' | 'date' | 'upvotes') => {
    if (option === 'priority') {
      showNotification(getComingSoonMessage('priority sorting'));
      return;
    }
    setSortOption(option);
  };

  const handleDeleteSelected = async () => {
    if (selectedArticleIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedArticleIds.length} selected article(s)?`)) {
      const promises = selectedArticleIds.map(id => deleteArticle(id));
      await Promise.all(promises);
    }
  };

  const handleReduceText = () => {
    showNotification(getComingSoonMessage('AI text reduction'));
  };

  const handleValidateProduction = () => {
    showNotification(getComingSoonMessage('production validation'));
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
    const selectedArticlesList = editableArticles.filter(article => selectedArticleIds.includes(article.id));
    
    return (
      <div className="relative min-h-screen bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50">
        <Background />
        <div className="max-w-[80rem] mx-auto py-8 px-4 sm:px-8 md:px-16 lg:px-24">
          <Header 
            isEditMode={true}
            onAddArticle={createArticle}
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
            onDelete={deleteArticle}
            onUpvote={handleUpvote}
            hasUserUpvoted={hasUserUpvoted}
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleValidateProduction}
              className="controls-appear px-6 py-2.5 bg-zenon-primary text-white rounded-zenon hover:bg-zenon-primary-dark transition-colors"
            >
              Validate Production
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50">
      <Background />
      <div className="max-w-[80rem] mx-auto py-8 px-4 sm:px-8 md:px-16 lg:px-24">
        <Header
          showBulkSelect={!isEditMode}
          onBulkSelect={selectFirstN}
          onPublish={handlePublish}
          selectedCount={selectedArticleIds.length}
          isEditMode={isEditMode}
          onAddArticle={createArticle}
        />
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 controls-appear">
            <div className="flex items-center gap-3">
              <span className="text-sm">Select first</span>
              <input
                type="number"
                min="0"
                value={inputValue}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setInputValue(value);
                  selectFirstN(value);
                }}
                className="w-20 px-3 py-2 text-sm bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary"
              />
              <span className="text-sm">articles</span>
            </div>
          </div>
          <div className="flex items-center gap-4 controls-appear">
            <button
              onClick={handlePublish}
              disabled={selectedArticleIds.length === 0}
              className={`w-44 px-6 py-2.5 rounded-zenon transition-colors flex items-center justify-between whitespace-nowrap ${
                selectedArticleIds.length > 0
                  ? 'bg-zenon-primary text-white hover:bg-zenon-primary-dark'
                  : 'bg-zenon-light-border/50 dark:bg-zenon-dark-border/50 text-zenon-light-text/50 dark:text-zenon-dark-text/50 cursor-not-allowed'
              }`}
            >
              <span className="flex-1 text-center">
                Publish{selectedArticleIds.length > 1 ? ` (${selectedArticleIds.length})` : ''}
              </span>
              <ChevronRight size={16} className="flex-shrink-0 ml-2" />
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedArticleIds.length === 0}
              className="px-4 py-2 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon hover:bg-zenon-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedArticleIds.length})
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clean all backslashes from the database? This action cannot be undone.')) {
                  cleanBackslashesInDatabase();
                }
              }}
              className="px-4 py-2 bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon hover:bg-zenon-primary/10 transition-colors"
            >
              Clean Backslashes
            </button>
          </div>
        </div>
        <Routes>
          <Route path="/" element={
            <ArticleList
              articles={isEditMode ? editableArticles : initialArticles}
              onReorder={!isEditMode ? moveArticle : undefined}
              showSelect={!isEditMode}
              isSelected={(article) => isArticleSelected(article.id)}
              onSelect={toggleArticleSelection}
              isEditMode={isEditMode}
              onEdit={handleEdit}
              onDelete={deleteArticle}
              onUpvote={handleUpvote}
              hasUserUpvoted={hasUserUpvoted}
              currentSort={sortOption}
              onSortChange={handleSortChange}
            />
          } />
          <Route path="/trash" element={<TrashPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <ErrorBoundary>
        <SessionContextProvider supabaseClient={supabase}>
          <AuthProvider>
            <BackgroundProvider>
              <NotificationProvider>
                {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
                <MainApp />
              </NotificationProvider>
            </BackgroundProvider>
          </AuthProvider>
        </SessionContextProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;