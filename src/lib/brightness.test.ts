import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    adjustLightness,
    adjustOklchColor,
    applyBrightnessToDocument,
    clearBrightnessCache,
    DEFAULT_BRIGHTNESS,
    getStoredBrightness,
    parseOklchLightness,
    replaceOklchLightness,
    resetBrightnessOnDocument,
    setStoredBrightness,
    type BrightnessSettings,
} from "./brightness";

describe("brightness utilities", () => {
  describe("adjustLightness", () => {
    it("returns original lightness when brightness is 100", () => {
      expect(adjustLightness(0.5, 100)).toBe(0.5);
      expect(adjustLightness(0.2, 100)).toBe(0.2);
      expect(adjustLightness(0.8, 100)).toBe(0.8);
    });

    it("darkens when brightness is below 100", () => {
      expect(adjustLightness(0.5, 50)).toBe(0.25);
      expect(adjustLightness(0.8, 50)).toBe(0.4);
      expect(adjustLightness(0.5, 0)).toBe(0);
    });

    it("brightens when brightness is above 100", () => {
      expect(adjustLightness(0.5, 150)).toBe(0.75);
      expect(adjustLightness(0.4, 200)).toBe(0.8);
    });

    it("clamps to valid range 0-1", () => {
      expect(adjustLightness(0.8, 200)).toBe(1);
      expect(adjustLightness(0.1, 0)).toBe(0);
      expect(adjustLightness(1, 150)).toBe(1);
      expect(adjustLightness(0, 50)).toBe(0);
    });
  });

  describe("parseOklchLightness", () => {
    it("extracts lightness from valid OKLCH strings", () => {
      expect(parseOklchLightness("oklch(0.5 0.2 180)")).toBe(0.5);
      expect(parseOklchLightness("oklch(0.205 0 0)")).toBe(0.205);
      expect(parseOklchLightness("oklch(0.985 0 0)")).toBe(0.985);
      expect(parseOklchLightness("oklch(1 0 0 / 10%)")).toBe(1);
    });

    it("handles whitespace variations", () => {
      expect(parseOklchLightness("oklch( 0.5 0.2 180 )")).toBe(0.5);
      expect(parseOklchLightness("oklch(0.5  0.2  180)")).toBe(0.5);
    });

    it("returns null for invalid strings", () => {
      expect(parseOklchLightness("")).toBeNull();
      expect(parseOklchLightness("rgb(255, 0, 0)")).toBeNull();
      expect(parseOklchLightness("invalid")).toBeNull();
    });
  });

  describe("replaceOklchLightness", () => {
    it("replaces lightness value in OKLCH string", () => {
      expect(replaceOklchLightness("oklch(0.5 0.2 180)", 0.75)).toBe("oklch(0.750 0.2 180)");
      expect(replaceOklchLightness("oklch(0.205 0 0)", 0.5)).toBe("oklch(0.500 0 0)");
    });

    it("preserves alpha channel", () => {
      expect(replaceOklchLightness("oklch(1 0 0 / 10%)", 0.5)).toBe("oklch(0.500 0 0 / 10%)");
    });

    it("formats with 3 decimal places", () => {
      expect(replaceOklchLightness("oklch(0.5 0.2 180)", 0.12345)).toBe("oklch(0.123 0.2 180)");
    });
  });

  describe("adjustOklchColor", () => {
    it("adjusts OKLCH color string brightness", () => {
      const result = adjustOklchColor("oklch(0.5 0.2 180)", 150);
      expect(parseOklchLightness(result)).toBe(0.75);
    });

    it("returns original string if parsing fails", () => {
      const invalid = "rgb(255, 0, 0)";
      expect(adjustOklchColor(invalid, 150)).toBe(invalid);
    });

    it("handles extreme brightness values", () => {
      const darkened = adjustOklchColor("oklch(0.5 0.2 180)", 0);
      expect(parseOklchLightness(darkened)).toBe(0);

      const brightened = adjustOklchColor("oklch(0.8 0.2 180)", 200);
      expect(parseOklchLightness(brightened)).toBe(1);
    });
  });

  describe("localStorage operations", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    describe("getStoredBrightness", () => {
      it("returns default when nothing is stored", () => {
        expect(getStoredBrightness()).toEqual(DEFAULT_BRIGHTNESS);
      });

      it("returns stored brightness settings", () => {
        const settings: BrightnessSettings = {
          fgLight: 120,
          bgLight: 80,
          fgDark: 90,
          bgDark: 110,
        };
        localStorage.setItem("brightness-settings", JSON.stringify(settings));
        expect(getStoredBrightness()).toEqual(settings);
      });

      it("returns default for invalid JSON", () => {
        localStorage.setItem("brightness-settings", "invalid json");
        expect(getStoredBrightness()).toEqual(DEFAULT_BRIGHTNESS);
      });

      it("fills in missing values with defaults", () => {
        localStorage.setItem("brightness-settings", JSON.stringify({ fgLight: 150 }));
        const result = getStoredBrightness();
        expect(result.fgLight).toBe(150);
        expect(result.bgLight).toBe(DEFAULT_BRIGHTNESS.bgLight);
        expect(result.fgDark).toBe(DEFAULT_BRIGHTNESS.fgDark);
        expect(result.bgDark).toBe(DEFAULT_BRIGHTNESS.bgDark);
      });
    });

    describe("setStoredBrightness", () => {
      it("stores brightness settings to localStorage", () => {
        const settings: BrightnessSettings = {
          fgLight: 130,
          bgLight: 70,
          fgDark: 95,
          bgDark: 105,
        };
        setStoredBrightness(settings);
        expect(localStorage.getItem("brightness-settings")).toBe(JSON.stringify(settings));
      });
    });
  });

  describe("document operations", () => {
    beforeEach(() => {
      document.documentElement.style.cssText = "";
      clearBrightnessCache();
      // Set up mock CSS variables that the brightness functions will read
      vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({
        getPropertyValue: (prop: string) => {
          const vars: Record<string, string> = {
            "--foreground": "oklch(0.145 0 0)",
            "--background": "oklch(1 0 0)",
            "--primary": "oklch(0.205 0 0)",
            "--primary-foreground": "oklch(0.985 0 0)",
            "--muted-foreground": "oklch(0.556 0 0)",
          };
          return vars[prop] || "";
        },
      }) as CSSStyleDeclaration);
    });

    afterEach(() => {
      document.documentElement.style.cssText = "";
      clearBrightnessCache();
      vi.restoreAllMocks();
    });

    describe("applyBrightnessToDocument", () => {
      it("applies CSS variable adjustments when foreground brightness is not default", () => {
        const settings: BrightnessSettings = {
          fgLight: 120,
          bgLight: 100,
          fgDark: 100,
          bgDark: 100,
        };

        applyBrightnessToDocument(settings, false);

        const root = document.documentElement;
        // Should have set foreground variable with adjusted lightness
        const fg = root.style.getPropertyValue("--foreground");
        expect(fg).toContain("oklch(");
      });

      it("applies CSS variable adjustments when background brightness is not default", () => {
        const settings: BrightnessSettings = {
          fgLight: 100,
          bgLight: 120,
          fgDark: 100,
          bgDark: 100,
        };

        applyBrightnessToDocument(settings, false);

        const root = document.documentElement;
        // Should have set background variable with adjusted lightness
        const bg = root.style.getPropertyValue("--background");
        expect(bg).toContain("oklch(");
      });

      it("applies correct adjustments for dark mode", () => {
        const settings: BrightnessSettings = {
          fgLight: 100,
          bgLight: 100,
          fgDark: 80,
          bgDark: 80,
        };

        applyBrightnessToDocument(settings, true);

        const root = document.documentElement;
        // Should have adjusted foreground and background for dark mode
        expect(root.style.getPropertyValue("--foreground")).toContain("oklch(");
        expect(root.style.getPropertyValue("--background")).toContain("oklch(");
      });

      it("removes style overrides when brightness is at default", () => {
        // First apply non-default brightness
        applyBrightnessToDocument({ fgLight: 150, bgLight: 150, fgDark: 100, bgDark: 100 }, false);

        const root = document.documentElement;
        expect(root.style.getPropertyValue("--foreground")).toBeTruthy();

        // Now apply default brightness
        applyBrightnessToDocument(DEFAULT_BRIGHTNESS, false);

        // Should have removed the inline style overrides
        expect(root.style.getPropertyValue("--foreground")).toBe("");
        expect(root.style.getPropertyValue("--background")).toBe("");
      });

      it("adjusts foreground independently from background", () => {
        const settings: BrightnessSettings = {
          fgLight: 140,
          bgLight: 100,
          fgDark: 100,
          bgDark: 100,
        };

        applyBrightnessToDocument(settings, false);

        const root = document.documentElement;
        // Foreground should be adjusted
        expect(root.style.getPropertyValue("--foreground")).toBeTruthy();
        // Background should not be adjusted (brightness is 100)
        expect(root.style.getPropertyValue("--background")).toBe("");
      });

      it("adjusts background independently from foreground", () => {
        const settings: BrightnessSettings = {
          fgLight: 100,
          bgLight: 140,
          fgDark: 100,
          bgDark: 100,
        };

        applyBrightnessToDocument(settings, false);

        const root = document.documentElement;
        // Foreground should not be adjusted (brightness is 100)
        expect(root.style.getPropertyValue("--foreground")).toBe("");
        // Background should be adjusted
        expect(root.style.getPropertyValue("--background")).toBeTruthy();
      });

      it("handles brightness values above 100 by increasing lightness", () => {
        const settings: BrightnessSettings = {
          fgLight: 150,
          bgLight: 100,
          fgDark: 100,
          bgDark: 100,
        };

        applyBrightnessToDocument(settings, false);

        const root = document.documentElement;
        const fg = root.style.getPropertyValue("--foreground");
        // Original lightness 0.145, with 150% brightness = 0.2175
        expect(fg).toBe("oklch(0.217 0 0)");
      });

      it("handles brightness values below 100 by decreasing lightness", () => {
        const settings: BrightnessSettings = {
          fgLight: 50,
          bgLight: 100,
          fgDark: 100,
          bgDark: 100,
        };

        applyBrightnessToDocument(settings, false);

        const root = document.documentElement;
        const fg = root.style.getPropertyValue("--foreground");
        // Original lightness 0.145, with 50% brightness = 0.0725
        expect(fg).toBe("oklch(0.072 0 0)");
      });
    });

    describe("resetBrightnessOnDocument", () => {
      it("removes CSS variable overrides", () => {
        // First apply brightness
        applyBrightnessToDocument({ fgLight: 150, bgLight: 150, fgDark: 100, bgDark: 100 }, false);

        const root = document.documentElement;
        expect(root.style.getPropertyValue("--foreground")).toBeTruthy();
        expect(root.style.getPropertyValue("--background")).toBeTruthy();

        // Then reset
        resetBrightnessOnDocument();

        expect(root.style.getPropertyValue("--foreground")).toBe("");
        expect(root.style.getPropertyValue("--background")).toBe("");
      });

      it("clears the brightness cache", () => {
        // Apply brightness to populate cache
        applyBrightnessToDocument({ fgLight: 150, bgLight: 100, fgDark: 100, bgDark: 100 }, false);

        // Reset should clear cache
        resetBrightnessOnDocument();

        // Apply again - should re-read from computed styles
        applyBrightnessToDocument({ fgLight: 150, bgLight: 100, fgDark: 100, bgDark: 100 }, false);

        const root = document.documentElement;
        expect(root.style.getPropertyValue("--foreground")).toBeTruthy();
      });
    });
  });

  describe("DEFAULT_BRIGHTNESS constant", () => {
    it("has correct default values", () => {
      expect(DEFAULT_BRIGHTNESS).toEqual({
        fgLight: 100,
        bgLight: 100,
        fgDark: 100,
        bgDark: 100,
      });
    });
  });
});
