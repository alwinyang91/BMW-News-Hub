export interface Article {
  title: string;
  date: string;
  article_type: string;
  summary: string;
  tags: string[];
  url: string;
  content: string;
}

export interface ArticlesData {
  scraped_at?: string;
  source?: string;
  count: number;
  articles: Article[];
}
