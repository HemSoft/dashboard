import { describe, expect, it, vi } from "vitest";
import { fetchNews } from "./actions";

vi.mock("./data", () => ({
  getNewsItems: vi.fn().mockResolvedValue([
    {
      id: "1",
      title: "Test News",
      summary: "Test summary",
      source: "Test Source",
      url: "https://example.com",
      publishedAt: new Date("2025-12-20T10:00:00Z"),
      category: "dev",
    },
  ]),
  mockNewsItems: [
    {
      id: "1",
      title: "Test News",
      summary: "Test summary",
      source: "Test Source",
      url: "https://example.com",
      publishedAt: new Date("2025-12-20T10:00:00Z"),
      category: "dev",
    },
  ],
}));

describe("News Actions", () => {
  describe("fetchNews", () => {
    it("returns news items", async () => {
      const items = await fetchNews();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("Test News");
    });
  });
});
