import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Article } from '../types';

interface AddArticleModalProps {
  onClose: () => void;
  onAdd: (article: Partial<Article>) => void;
}

export const AddArticleModal: React.FC<AddArticleModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    source: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title: formData.title,
      summary: formData.summary,
      source: formData.source,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      published_at: new Date().toISOString(),
      position: 0, // Sera mis à jour par le backend
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon shadow-xl border border-zenon-primary/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-zenon-light-text dark:text-zenon-dark-text">
            Add New Article
          </h2>
          <button
            onClick={onClose}
            className="text-zenon-light-text/60 dark:text-zenon-dark-text/60 hover:text-zenon-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zenon-light-text/80 dark:text-zenon-dark-text/80 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zenon-light-text/80 dark:text-zenon-dark-text/80 mb-1">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full min-h-[200px] p-2 bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zenon-light-text/80 dark:text-zenon-dark-text/80 mb-1">
              Source URL
            </label>
            <input
              type="url"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              className="w-full p-2 bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zenon-light-text/80 dark:text-zenon-dark-text/80 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full p-2 bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-border dark:border-zenon-dark-border rounded-zenon focus:outline-none focus:border-zenon-primary"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-zenon-primary text-white rounded-zenon hover:bg-zenon-primary/90 transition-colors"
            >
              Add Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
