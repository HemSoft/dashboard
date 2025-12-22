import type { FeedError, FetchNewsResult, NewsItem, RssSource } from "../types";
import { parseRssFeed } from "./rss-parser";
import { MAX_AGE_DAYS, MAX_ITEMS_PER_SOURCE, rssSources } from "./sources";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface FetchSourceResult {
  items: NewsItem[];
  error?: FeedError;
}

/**
 * Fetch and parse a single RSS source.
 */
async function fetchSource(source: RssSource): Promise<FetchSourceResult> {
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return {
        items: [],
        error: {
          source: source.name,
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }

    const xml = await response.text();
    const items = parseRssFeed(xml, source);
    return { items: items.slice(0, MAX_ITEMS_PER_SOURCE) };
  } catch (err) {
    return {
      items: [],
      error: {
        source: source.name,
        message: err instanceof Error ? err.message : "Unknown error",
      },
    };
  }
}

/**
 * Filter items by maximum age.
 */
function filterByAge(items: NewsItem[], maxAgeDays: number): NewsItem[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  return items.filter((item) => item.publishedAt >= cutoff);
}

/**
 * Sort items by publication date (newest first).
 */
function sortByDate(items: NewsItem[]): NewsItem[] {
  return items.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
}

/**
 * Fetch news from all configured RSS sources.
 */
export async function fetchAllNews(): Promise<FetchNewsResult> {
  const results = await Promise.all(rssSources.map(fetchSource));

  const allItems: NewsItem[] = [];
  const errors: FeedError[] = [];

  for (const result of results) {
    allItems.push(...result.items);
    if (result.error) {
      errors.push(result.error);
    }
  }

  const filteredItems = filterByAge(allItems, MAX_AGE_DAYS);
  const sortedItems = sortByDate(filteredItems);

  return {
    items: sortedItems,
    errors,
  };
}
