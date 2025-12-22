import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewsPage from "./page";

vi.mock("@/modules/news", () => ({
  fetchNews: vi.fn().mockResolvedValue({
    items: [
      {
        id: "1",
        title: "Test News Item 1",
        summary: "Test summary 1",
        source: "Test Source",
        url: "https://example.com/1",
        publishedAt: new Date("2025-12-20T10:00:00Z"),
        category: "dev",
      },
      {
        id: "2",
        title: "Test News Item 2",
        summary: "Test summary 2",
        source: "Test Source",
        url: "https://example.com/2",
        publishedAt: new Date("2025-12-19T10:00:00Z"),
        category: "ai",
      },
    ],
    errors: [],
  }),
  NewsItemComponent: ({ item }: { item: { title: string } }) => (
    <div data-testid="news-item">{item.title}</div>
  ),
  RefreshButton: () => <button>Refresh</button>,
}));

describe("News Page", () => {
  it("renders page header", async () => {
    const Page = await NewsPage();
    render(Page);

    expect(screen.getByText("News")).toBeDefined();
    expect(screen.getByText("Stay updated with the latest from your sources.")).toBeDefined();
  });

  it("renders back button", async () => {
    const Page = await NewsPage();
    render(Page);

    const backLink = screen.getByRole("link", { name: /back to dashboard/i });
    expect(backLink.getAttribute("href")).toBe("/");
  });

  it("renders refresh button", async () => {
    const Page = await NewsPage();
    render(Page);

    expect(screen.getByRole("button", { name: /refresh/i })).toBeDefined();
  });

  it("renders all news items", async () => {
    const Page = await NewsPage();
    render(Page);

    expect(screen.getByText("Test News Item 1")).toBeDefined();
    expect(screen.getByText("Test News Item 2")).toBeDefined();
  });
});

describe("News Page empty state", () => {
  it("shows empty message when no items", async () => {
    const { fetchNews } = await import("@/modules/news");
    vi.mocked(fetchNews).mockResolvedValueOnce({ items: [], errors: [] });

    const Page = await NewsPage();
    render(Page);

    expect(screen.getByText("No news items available")).toBeDefined();
  });
});

describe("News Page error state", () => {
  it("shows error alert when feeds fail", async () => {
    const { fetchNews } = await import("@/modules/news");
    vi.mocked(fetchNews).mockResolvedValueOnce({
      items: [],
      errors: [
        { source: "BBC Tech", message: "HTTP 500" },
        { source: "NPR News", message: "Network error" },
      ],
    });

    const Page = await NewsPage();
    render(Page);

    expect(screen.getByText("Some feeds failed to load")).toBeDefined();
    expect(screen.getByText("BBC Tech, NPR News")).toBeDefined();
  });
});
