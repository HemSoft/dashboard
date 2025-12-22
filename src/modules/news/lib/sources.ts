import type { RssSource } from "../types";

/**
 * Static RSS feed sources configuration.
 * Categories: ai, tech, general (world/denmark mapped to general).
 */
export const rssSources: RssSource[] = [
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com/rss",
    category: "tech",
  },
  {
    name: "AP",
    url: "https://feedx.net/rss/ap.xml",
    category: "general",
  },
  {
    name: "BBC Tech",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    category: "tech",
  },
  {
    name: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    category: "general",
  },
  {
    name: "NPR Tech",
    url: "https://feeds.npr.org/1019/rss.xml",
    category: "tech",
  },
  {
    name: "DR Nyheder",
    url: "https://www.dr.dk/nyheder/service/feeds/allenyheder",
    category: "general",
  },
  {
    name: "MIT Tech AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    category: "ai",
  },
  {
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    category: "ai",
  },
  {
    name: "VS Code",
    url: "https://code.visualstudio.com/feed.xml",
    category: "dev",
  },
];

/** Maximum age of news items in days */
export const MAX_AGE_DAYS = 5;

/** Maximum items to fetch per source */
export const MAX_ITEMS_PER_SOURCE = 20;
