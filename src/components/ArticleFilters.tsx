import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Calendar, ThumbsUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type SortOption = 'priority' | 'date' | 'upvotes';

interface ArticleFiltersProps {
  onTagSelect: (tags: string[]) => void;
  onSortChange: (option: SortOption) => void;
  selectedTags: string[];
  currentSort: SortOption;
}

export const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  onTagSelect,
  onSortChange,
  selectedTags,
  currentSort,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data: articles, error } = await supabase
        .from('articles')
        .select('tags')
        .eq('is_deleted', false);

      if (error) throw error;

      // Extract unique tags and remove empty ones
      const allTags = articles?.flatMap(article => article.tags || []) || [];
      const uniqueTags = Array.from(new Set(allTags))
        .filter(tag => tag && tag.trim() !== '')
        .sort();

      setTags(uniqueTags);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendToWebhook = async () => {
    console.log('Starting webhook send...');
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('title, summary')
        .eq('is_deleted', false);

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (!articles || articles.length === 0) {
        console.log('No articles found');
        return;
      }

      console.log('Articles fetched:', articles.length);

      // Envoyer les données dans un format différent
      const webhookData = {
        articles: articles.map(article => ({
          title: article.title || '',
          content: article.summary || ''
        }))
      };

      console.log('Sending to webhook:', webhookData);

      const response = await fetch('https://hook.eu2.make.com/2vqpjsbp8r4n15mdheai74gotyl9oxeg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      const responseText = await response.text();
      console.log('Webhook response:', response.status, responseText);

      if (!response.ok) {
        console.error('Webhook error:', response.status, responseText);
      } else {
        console.log('Articles sent to webhook successfully');
      }
    } catch (error) {
      console.error('Error in sendToWebhook:', error);
    }
  };

  const handlePriorityClick = async () => {
    console.log('Priority button clicked');
    await sendToWebhook();
    onSortChange('priority');
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    onTagSelect([]);
  };

  return (
    <div className="flex flex-col gap-4 mb-6 w-full">
      {/* Sort buttons */}
      <div className="controls-appear flex flex-wrap items-center gap-2">
        <button
          onClick={handlePriorityClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-zenon transition-colors ${
            currentSort === 'priority'
              ? 'bg-zenon-primary text-white'
              : 'bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50 text-zenon-light-text/70 dark:text-zenon-dark-text/70 hover:bg-zenon-primary/10'
          }`}
        >
          <Sparkles size={16} />
          <span>Priority</span>
        </button>
        <button
          onClick={() => onSortChange('date')}
          className={`flex items-center gap-2 px-4 py-2 rounded-zenon transition-colors ${
            currentSort === 'date'
              ? 'bg-zenon-primary text-white'
              : 'bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50 text-zenon-light-text/70 dark:text-zenon-dark-text/70 hover:bg-zenon-primary/10'
          }`}
        >
          <Calendar size={16} />
          <span>Date</span>
        </button>
        <button
          onClick={() => onSortChange('upvotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-zenon transition-colors ${
            currentSort === 'upvotes'
              ? 'bg-zenon-primary text-white'
              : 'bg-zenon-light-bg/50 dark:bg-zenon-dark-bg/50 text-zenon-light-text/70 dark:text-zenon-dark-text/70 hover:bg-zenon-primary/10'
          }`}
        >
          <ThumbsUp size={16} />
          <span>Upvotes</span>
        </button>
      </div>

      {/* Tag list */}
      <div className="controls-appear flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500/10'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
