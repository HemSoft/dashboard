import { describe, expect, it } from "vitest";
import { getNewsItems, mockNewsItems } from "./data";
import type { NewsItem } from "./types";

describe("News Data", () => {
  describe("mockNewsItems", () => {
    it("contains news items with required properties", () => {
      expect(mockNewsItems.length).toBeGreaterThan(0);

      for (const item of mockNewsItems) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("summary");
        expect(item).toHaveProperty("source");
        expect(item).toHaveProperty("url");
        expect(item).toHaveProperty("publishedAt");
        expect(item).toHaveProperty("category");
      }
    });

    it("has valid categories", () => {
      const validCategories: NewsItem["category"][] = ["tech", "dev", "ai", "general"];

      for (const item of mockNewsItems) {
        expect(validCategories).toContain(item.category);
      }
    });

    it("has valid dates", () => {
      for (const item of mockNewsItems) {
        expect(item.publishedAt).toBeInstanceOf(Date);
        expect(item.publishedAt.getTime()).not.toBeNaN();
      }
    });
  });

  describe("getNewsItems", () => {
    it("returns mock news items", async () => {
      const items = await getNewsItems();
      expect(items).toEqual(mockNewsItems);
    });
  });
});
