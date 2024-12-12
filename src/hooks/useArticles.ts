import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import { useLocation } from 'react-router-dom';
import { RealtimeChannel } from '@supabase/supabase-js';

type SortOption = 'priority' | 'date' | 'upvotes';

export const useArticles = (selectedTag: string | null = null, sortOption: SortOption = 'priority') => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [deletedArticles, setDeletedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const location = useLocation();

  // Fonction pour s'abonner aux changements en temps réel
  const subscribeToRealtimeChanges = () => {
    const channel = supabase
      .channel('article-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écoute tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'articles'
        },
        async (payload) => {
          console.log('Realtime change received:', payload);
          
          // Rafraîchir les listes d'articles
          await Promise.all([
            fetchArticles(),
            fetchDeletedArticles()
          ]);
        }
      )
      .subscribe();

    return channel;
  };

  const sendToWebhook = async (articles: Article[]) => {
    try {
      const articlesData = articles.map(article => ({
        title: article.title,
        content: article.summary
      }));

      const response = await fetch('https://hook.eu2.make.com/2vqpjsbp8r4n15mdheai74gotyl9oxeg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articlesData)
      });

      if (!response.ok) {
        console.error('Webhook error:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
    }
  };

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's upvotes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: upvotes } = await supabase
          .from('article_votes')
          .select('article_id')
          .eq('user_id', user.id);
        
        setUserUpvotes(upvotes?.map(vote => vote.article_id) || []);
      }

      let query = supabase
        .from('articles')
        .select('*')
        .eq('is_deleted', false);

      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let sortedArticles = [...(data || [])];

      // Tri des articles
      switch (sortOption) {
        case 'date':
          sortedArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
          break;
        case 'upvotes':
          sortedArticles.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
          break;
        case 'priority':
        default:
          sortedArticles.sort((a, b) => (b.position || 0) - (a.position || 0));
          break;
      }

      setArticles(sortedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedTag, sortOption]);

  const fetchDeletedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedArticles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching deleted articles');
    }
  };

  const handleUpvote = async (articleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const hasVoted = userUpvotes.includes(articleId);

      if (hasVoted) {
        // Retirer le vote
        await supabase
          .from('article_votes')
          .delete()
          .match({ user_id: user.id, article_id: articleId });

        await supabase.rpc('decrement_upvotes', { article_id: articleId });
        
        setUserUpvotes(prev => prev.filter(id => id !== articleId));
      } else {
        // Ajouter le vote
        await supabase
          .from('article_votes')
          .insert({ user_id: user.id, article_id: articleId });

        await supabase.rpc('increment_upvotes', { article_id: articleId });
        
        setUserUpvotes(prev => [...prev, articleId]);
      }

      // Mettre à jour l'article localement
      setArticles(prev =>
        prev.map(article =>
          article.id === articleId
            ? {
                ...article,
                upvotes: hasVoted
                  ? (article.upvotes || 1) - 1
                  : (article.upvotes || 0) + 1,
              }
            : article
        )
      );
    } catch (err) {
      console.error('Error updating vote:', err);
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

  const moveArticle = async (fromIndex: number, toIndex: number) => {
    try {
      const articleToMove = articles[fromIndex];
      
      // Mettre à jour uniquement l'état local
      setArticles(prev => {
        const newArticles = [...prev];
        const [movedArticle] = newArticles.splice(fromIndex, 1);
        newArticles.splice(toIndex, 0, movedArticle);
        return newArticles;
      });

    } catch (err) {
      console.error('Error moving article:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while moving the article');
    }
  };

  const toggleArticleSelection = async (article: Article) => {
    try {
      const newSelectedIds = selectedArticleIds.includes(article.id)
        ? selectedArticleIds.filter(id => id !== article.id)
        : [...selectedArticleIds, article.id];

      // Mettre à jour la sélection dans la base de données
      const { error } = await supabase
        .from('articles')
        .update({ is_selected: !selectedArticleIds.includes(article.id) })
        .eq('id', article.id);

      if (error) throw error;

      setSelectedArticleIds(newSelectedIds);
    } catch (err) {
      console.error('Error toggling article selection:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while selecting the article');
    }
  };

  const selectFirstN = async (n: number) => {
    try {
      if (n <= 0) {
        // Désélectionner tous les articles
        const { error } = await supabase
          .from('articles')
          .update({ is_selected: false })
          .eq('is_deleted', false);

        if (error) throw error;
        
        setSelectedArticleIds([]);
        return;
      }

      // Obtenir les articles filtrés et triés actuels
      let filteredAndSortedArticles = [...articles];

      // Appliquer le tri actuel
      filteredAndSortedArticles.sort((a, b) => {
        switch (sortOption) {
          case 'date':
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          case 'upvotes':
            return (b.upvotes || 0) - (a.upvotes || 0);
          case 'priority':
          default:
            return a.position - b.position;
        }
      });

      // Sélectionner les N premiers articles de la liste triée
      const articlesToSelect = filteredAndSortedArticles.slice(0, n);
      const idsToSelect = articlesToSelect.map(article => article.id);

      // D'abord, désélectionner tous les articles
      const { error: deselectAllError } = await supabase
        .from('articles')
        .update({ is_selected: false })
        .eq('is_deleted', false);

      if (deselectAllError) throw deselectAllError;

      // Ensuite, sélectionner les articles choisis
      const { error: selectError } = await supabase
        .from('articles')
        .update({ is_selected: true })
        .in('id', idsToSelect);

      if (selectError) throw selectError;

      setSelectedArticleIds(idsToSelect);
    } catch (err) {
      console.error('Error selecting first N articles:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while selecting articles');
    }
  };

  const isArticleSelected = (articleId: string) => {
    return selectedArticleIds.includes(articleId);
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Remove the article from selection
      setSelectedArticleIds(prev => prev.filter(articleId => articleId !== id));
      
      // Refresh both article lists
      await Promise.all([fetchArticles(), fetchDeletedArticles()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the article');
    }
  };

  const restoreArticle = async (id: string) => {
    try {
      console.log('Restoring article:', id);
      
      // First, get the current article data
      const { data: article, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!article) throw new Error('Article not found');

      console.log('Found article:', article);

      // Update the article
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          is_deleted: false,
          deleted_at: null
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating article:', updateError);
        throw updateError;
      }

      console.log('Article restored successfully');
      
      // Refresh both article lists
      await Promise.all([
        fetchArticles(),
        fetchDeletedArticles()
      ]);
    } catch (err) {
      console.error('Error in restoreArticle:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while restoring the article');
    }
  };

  const cleanBackslashesInDatabase = async () => {
    try {
      // Récupérer tous les articles
      const { data: articles, error: fetchError } = await supabase
        .from('articles')
        .select('*');

      if (fetchError) throw fetchError;
      if (!articles) return;

      // Pour chaque article, nettoyer le contenu et mettre à jour
      const updatePromises = articles.map(async (article) => {
        const cleanedSummary = article.summary.replace(/\\/g, '');
        
        const { error: updateError } = await supabase
          .from('articles')
          .update({ summary: cleanedSummary })
          .eq('id', article.id);

        if (updateError) throw updateError;
      });

      await Promise.all(updatePromises);
      
      // Rafraîchir les articles après le nettoyage
      await fetchArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while cleaning articles');
    }
  };

  const createArticle = async (articleData: Partial<Article>) => {
    try {
      // Calculer la position maximale actuelle
      const maxPosition = articles.reduce((max, article) => 
        Math.max(max, article.position), 0
      );

      // Préparer les données de l'article
      const newArticle = {
        ...articleData,
        position: maxPosition + 1,
        is_deleted: false,
        upvotes: 0,
        published_at: new Date().toISOString(),
      };

      // Insérer l'article dans la base de données
      const { data, error } = await supabase
        .from('articles')
        .insert([newArticle])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'état local
      if (data) {
        setArticles(prev => [...prev, data]);
      }

      return data;
    } catch (err) {
      console.error('Error creating article:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the article');
      return null;
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchDeletedArticles();
    
    // S'abonner aux changements en temps réel
    const channel = subscribeToRealtimeChanges();

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      channel.unsubscribe();
    };
  }, [location.pathname]);

  return {
    articles,
    deletedArticles,
    loading,
    error,
    selectedArticleIds,
    userUpvotes,
    createArticle,
    handleUpvote,
    hasUserUpvoted: (id: string) => userUpvotes.includes(id),
    updateArticle,
    moveArticle,
    toggleArticleSelection,
    selectFirstN,
    isArticleSelected,
    deleteArticle,
    restoreArticle,
    cleanBackslashesInDatabase,
  };
};