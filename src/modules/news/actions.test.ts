import { describe, expect, it, vi } from "vitest";
import { fetchNews, revalidateNews } from "./actions";

vi.mock("./lib/fetcher", () => ({
  fetchAllNews: vi.fn().mockResolvedValue({
    items: [
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
    errors: [],
  }),
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}));

describe("News Actions", () => {
  describe("fetchNews", () => {
    it("returns news items and errors", async () => {
      const result = await fetchNews();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe("Test News");
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("revalidateNews", () => {
    it("calls revalidatePath with /news", async () => {
      mockRevalidatePath.mockClear();
      await revalidateNews();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/news");
    });
  });
});
