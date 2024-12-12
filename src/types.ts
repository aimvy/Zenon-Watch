export interface Article {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  published_at: string;
  category: string;
  source: string;
  additionalSources?: string[];
  tags?: string[];
  position: number;
  is_selected: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  upvotes: number;
}

export interface ArticleEditable extends Article {
  editedSummary?: string;
}