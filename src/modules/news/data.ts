import type { NewsItem } from "./types";

/**
 * Mock news data for development.
 * Will be replaced with real API calls in a future iteration.
 */
export const mockNewsItems: NewsItem[] = [
  {
    id: "1",
    title: "Next.js 16 Released with Improved Performance",
    summary:
      "The latest version of Next.js brings significant performance improvements and new features for React Server Components.",
    source: "Vercel Blog",
    url: "https://nextjs.org/blog",
    publishedAt: new Date("2025-12-20T10:00:00Z"),
    category: "dev",
  },
  {
    id: "2",
    title: "Supabase Introduces New Realtime Features",
    summary:
      "Supabase announces enhanced realtime capabilities with better connection handling and reduced latency.",
    source: "Supabase Blog",
    url: "https://supabase.com/blog",
    publishedAt: new Date("2025-12-19T14:30:00Z"),
    category: "dev",
  },
  {
    id: "3",
    title: "OpenAI Announces GPT-5 Preview",
    summary:
      "OpenAI reveals early access to GPT-5 with improved reasoning and multimodal capabilities.",
    source: "OpenAI",
    url: "https://openai.com/blog",
    publishedAt: new Date("2025-12-18T09:00:00Z"),
    category: "ai",
  },
  {
    id: "4",
    title: "GitHub Copilot Workspace Now Generally Available",
    summary:
      "GitHub Copilot Workspace exits beta, offering AI-powered development environments for all users.",
    source: "GitHub Blog",
    url: "https://github.blog",
    publishedAt: new Date("2025-12-17T16:00:00Z"),
    category: "ai",
  },
  {
    id: "5",
    title: "Bun 2.0 Brings Native Windows Support",
    summary:
      "Bun 2.0 launches with full native Windows support, improved compatibility, and faster package installation.",
    source: "Bun Blog",
    url: "https://bun.sh/blog",
    publishedAt: new Date("2025-12-16T11:00:00Z"),
    category: "dev",
  },
];

export async function getNewsItems(): Promise<NewsItem[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockNewsItems;
}
