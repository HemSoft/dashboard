export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: "tech" | "dev" | "ai" | "general";
}

export interface NewsWidgetProps {
  items?: NewsItem[];
  maxItems?: number;
}
