export type NewsCategory = "tech" | "dev" | "ai" | "general";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: NewsCategory;
}

export interface RssSource {
  name: string;
  url: string;
  category: NewsCategory;
}

export interface FeedError {
  source: string;
  message: string;
}

export interface FetchNewsResult {
  items: NewsItem[];
  errors: FeedError[];
}

export interface NewsWidgetProps {
  items?: NewsItem[];
  maxItems?: number;
}
