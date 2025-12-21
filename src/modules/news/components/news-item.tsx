import { Badge } from "@/components/ui/badge";
import type { NewsItem as NewsItemType } from "../types";

interface NewsItemProps {
  item: NewsItemType;
  compact?: boolean;
}

const categoryColors: Record<NewsItemType["category"], string> = {
  tech: "bg-blue-500/10 text-blue-500",
  dev: "bg-green-500/10 text-green-500",
  ai: "bg-purple-500/10 text-purple-500",
  general: "bg-gray-500/10 text-gray-500",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NewsItemComponent({ item, compact = false }: NewsItemProps) {
  if (compact) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block py-3 hover:bg-accent/50 transition-colors -mx-2 px-2 rounded-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight line-clamp-2">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{item.source}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(item.publishedAt)}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className={categoryColors[item.category]}>
            {item.category}
          </Badge>
        </div>
      </a>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {item.summary}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">{item.source}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(item.publishedAt)}
            </span>
          </div>
        </div>
        <Badge variant="secondary" className={categoryColors[item.category]}>
          {item.category}
        </Badge>
      </div>
    </a>
  );
}
