import { useState, useEffect } from 'react';
import { Article } from '../types';
import { supabase } from '../lib/supabase';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedArticles: Article[] = data.map(article => ({
          id: article.id,
          title: article.title,
          summary: article.summary,
          createdAt: article.created_at,
          publishedAt: article.published_at,
          category: article.category,
          source: article.source,
          additionalSources: article.additional_sources || [],
          tags: article.tags,
        }));
        setArticles(formattedArticles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching articles');
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: updates.title,
          summary: updates.summary,
          category: updates.category,
          tags: updates.tags,
          additional_sources: updates.additionalSources,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setArticles(prev => prev.map(article => 
          article.id === id ? {
            ...article,
            ...updates
          } : article
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the article');
    }
  };

  const toggleArticleSelection = (article: Article) => {
    setSelectedArticles(prev => {
      const next = new Set(prev);
      if (next.has(article.id)) {
        next.delete(article.id);
      } else {
        next.add(article.id);
      }
      return next;
    });
  };

  const handleBulkSelect = (count: number) => {
    const newSelection = new Set(
      articles.slice(0, count).map(article => article.id)
    );
    setSelectedArticles(newSelection);
  };

  const moveArticle = async (fromIndex: number, toIndex: number) => {
    setArticles(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  return {
    articles,
    selectedArticles,
    toggleArticleSelection,
    moveArticle,
    handleBulkSelect,
    updateArticle,
    loading,
    error,
    refresh: fetchArticles,
  };
};