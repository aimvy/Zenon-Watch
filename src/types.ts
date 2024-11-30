export interface Article {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  publishedAt: string;
  category: string;
  source: string;
  additionalSources?: string[];
  tags: string[];
  selected?: boolean;
}

export interface ArticleEditable extends Article {
  editedSummary?: string;
}