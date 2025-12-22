"use client";

import {
    type FontName,
    applyFontToDocument,
    getStoredFontName,
    isValidFont,
    setStoredFontName,
} from "@/fonts";
import { useCallback, useEffect, useSyncExternalStore } from "react";

let listeners: Array<() => void> = [];

function emitFontChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot(): FontName {
  return getStoredFontName();
}

// Exported for testing - used by useSyncExternalStore during SSR
export function getServerSnapshot(): FontName {
  return "geist";
}

/**
 * Hook to manage the current font selection.
 * Syncs with localStorage and applies to document.
 */
export function useFont() {
  const font = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyFontToDocument(font);
  }, [font]);

  const setFont = useCallback((newFont: FontName) => {
    if (!isValidFont(newFont)) return;
    setStoredFontName(newFont);
    applyFontToDocument(newFont);
    emitFontChange();
  }, []);

  return { font, setFont };
}

/**
 * Initialize font from localStorage on page load.
 * Call this in a client component that mounts early (e.g., layout).
 */
export function useFontInit(serverFont?: string | null) {
  useEffect(() => {
    // Priority: localStorage > serverFont (from DB) > default
    const stored = getStoredFontName();
    if (stored !== "geist") {
      applyFontToDocument(stored);
      return;
    }

    if (serverFont && isValidFont(serverFont)) {
      setStoredFontName(serverFont);
      applyFontToDocument(serverFont);
      return;
    }

    applyFontToDocument("geist");
  }, [serverFont]);
}
