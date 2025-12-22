import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
    defaultBrand,
    getSourceBrand,
    sourceBranding,
} from "./source-branding";

describe("source-branding", () => {
  describe("sourceBranding", () => {
    it("has branding for all known sources", () => {
      const knownSources = [
        "Hacker News",
        "AP",
        "BBC Tech",
        "NPR News",
        "NPR Tech",
        "DR Nyheder",
        "MIT Tech AI",
        "VentureBeat AI",
        "VS Code",
      ];

      for (const source of knownSources) {
        expect(sourceBranding[source]).toBeDefined();
        expect(sourceBranding[source].icon).toBeDefined();
        expect(sourceBranding[source].bgColor).toBeDefined();
        expect(sourceBranding[source].textColor).toBeDefined();
        expect(sourceBranding[source].borderColor).toBeDefined();
      }
    });

    it("each brand has valid Tailwind classes", () => {
      for (const brand of Object.values(sourceBranding)) {
        expect(brand.bgColor).toMatch(/^bg-/);
        expect(brand.textColor).toMatch(/^text-/);
        expect(brand.borderColor).toMatch(/^border-/);
      }
    });

    it("each brand icon renders", () => {
      for (const brand of Object.values(sourceBranding)) {
        const { container } = render(<>{brand.icon}</>);
        expect(container.querySelector("svg")).toBeDefined();
      }
    });
  });

  describe("defaultBrand", () => {
    it("has all required properties", () => {
      expect(defaultBrand.icon).toBeDefined();
      expect(defaultBrand.bgColor).toBeDefined();
      expect(defaultBrand.textColor).toBeDefined();
      expect(defaultBrand.borderColor).toBeDefined();
    });

    it("has valid Tailwind classes", () => {
      expect(defaultBrand.bgColor).toMatch(/^bg-/);
      expect(defaultBrand.textColor).toMatch(/^text-/);
      expect(defaultBrand.borderColor).toMatch(/^border-/);
    });

    it("renders icon", () => {
      const { container } = render(<>{defaultBrand.icon}</>);
      expect(container.querySelector("svg")).toBeDefined();
    });
  });

  describe("getSourceBrand", () => {
    it("returns branding for known sources", () => {
      const brand = getSourceBrand("Hacker News");
      expect(brand).toBe(sourceBranding["Hacker News"]);
    });

    it("returns default brand for unknown sources", () => {
      const brand = getSourceBrand("Unknown Source");
      expect(brand).toBe(defaultBrand);
    });

    it("returns default brand for empty string", () => {
      const brand = getSourceBrand("");
      expect(brand).toBe(defaultBrand);
    });
  });
});
