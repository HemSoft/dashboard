import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getServerSnapshot, useFont, useFontInit } from "./use-font";

describe("useFont", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attributes
    document.documentElement.removeAttribute("data-font");
    document.documentElement.style.removeProperty("--font-sans");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-font");
    document.documentElement.style.removeProperty("--font-sans");
  });

  describe("useFont hook", () => {
    it("returns default font when no font is stored", () => {
      const { result } = renderHook(() => useFont());
      expect(result.current.font).toBe("geist");
    });

    it("returns stored font from localStorage", () => {
      localStorage.setItem("dashboard-font", "inter");
      const { result } = renderHook(() => useFont());
      expect(result.current.font).toBe("inter");
    });

    it("setFont updates localStorage and document", () => {
      const { result } = renderHook(() => useFont());

      act(() => {
        result.current.setFont("roboto");
      });

      expect(localStorage.getItem("dashboard-font")).toBe("roboto");
      expect(document.documentElement.getAttribute("data-font")).toBe("roboto");
    });

    it("setFont ignores invalid fonts", () => {
      const { result } = renderHook(() => useFont());

      act(() => {
        result.current.setFont("invalid" as "geist");
      });

      // Should still be null (not set)
      expect(localStorage.getItem("dashboard-font")).toBeNull();
    });

    it("applies font to document on mount", () => {
      localStorage.setItem("dashboard-font", "nunito");
      renderHook(() => useFont());

      expect(document.documentElement.getAttribute("data-font")).toBe("nunito");
    });

    it("notifies listeners when font changes", () => {
      const { result, rerender } = renderHook(() => useFont());

      act(() => {
        result.current.setFont("lato");
      });

      // Rerender to pick up state change
      rerender();

      expect(result.current.font).toBe("lato");
    });
  });

  describe("getServerSnapshot", () => {
    it("returns default font for SSR", () => {
      expect(getServerSnapshot()).toBe("geist");
    });
  });

  describe("useFontInit hook", () => {
    it("applies stored font from localStorage", () => {
      localStorage.setItem("dashboard-font", "inter");
      renderHook(() => useFontInit());

      expect(document.documentElement.getAttribute("data-font")).toBe("inter");
    });

    it("applies server font when localStorage is default", () => {
      localStorage.setItem("dashboard-font", "geist");
      renderHook(() => useFontInit("roboto"));

      expect(document.documentElement.getAttribute("data-font")).toBe("roboto");
      expect(localStorage.getItem("dashboard-font")).toBe("roboto");
    });

    it("applies default when no stored or server font", () => {
      renderHook(() => useFontInit());

      expect(document.documentElement.getAttribute("data-font")).toBe("geist");
    });

    it("ignores invalid server font", () => {
      renderHook(() => useFontInit("invalid-font"));

      expect(document.documentElement.getAttribute("data-font")).toBe("geist");
    });

    it("prefers localStorage over server font", () => {
      localStorage.setItem("dashboard-font", "nunito");
      renderHook(() => useFontInit("inter"));

      expect(document.documentElement.getAttribute("data-font")).toBe("nunito");
    });
  });
});
