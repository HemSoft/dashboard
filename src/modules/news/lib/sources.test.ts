import { describe, expect, it } from "vitest";
import { MAX_AGE_DAYS, MAX_ITEMS_PER_SOURCE, rssSources } from "./sources";

describe("RSS Sources", () => {
  describe("rssSources", () => {
    it("contains expected number of sources", () => {
      expect(rssSources).toHaveLength(9);
    });

    it("has valid structure for each source", () => {
      for (const source of rssSources) {
        expect(source).toHaveProperty("name");
        expect(source).toHaveProperty("url");
        expect(source).toHaveProperty("category");
        expect(typeof source.name).toBe("string");
        expect(source.url).toMatch(/^https?:\/\//);
        expect(["tech", "dev", "ai", "general"]).toContain(source.category);
      }
    });

    it("includes Hacker News", () => {
      const hn = rssSources.find((s) => s.name === "Hacker News");
      expect(hn).toBeDefined();
      expect(hn?.url).toBe("https://news.ycombinator.com/rss");
      expect(hn?.category).toBe("tech");
    });

    it("includes VS Code with dev category", () => {
      const vscode = rssSources.find((s) => s.name === "VS Code");
      expect(vscode).toBeDefined();
      expect(vscode?.category).toBe("dev");
    });

    it("includes AI sources", () => {
      const aiSources = rssSources.filter((s) => s.category === "ai");
      expect(aiSources.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("constants", () => {
    it("MAX_AGE_DAYS is 5", () => {
      expect(MAX_AGE_DAYS).toBe(5);
    });

    it("MAX_ITEMS_PER_SOURCE is 20", () => {
      expect(MAX_ITEMS_PER_SOURCE).toBe(20);
    });
  });
});
