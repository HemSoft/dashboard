import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshButton } from "./refresh-button";

const mockRefresh = vi.fn();
const mockRevalidateNews = vi.fn().mockResolvedValue(undefined);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("../actions", () => ({
  revalidateNews: () => mockRevalidateNews(),
}));

describe("RefreshButton", () => {
  beforeEach(() => {
    mockRefresh.mockClear();
    mockRevalidateNews.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with default state", () => {
    render(<RefreshButton />);

    expect(screen.getByRole("button", { name: /refresh/i })).toBeDefined();
    expect(screen.getByText("Refresh")).toBeDefined();
  });

  it("calls revalidateNews and router.refresh when clicked", async () => {
    render(<RefreshButton />);

    const button = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(button);

    // Wait for the async action to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRevalidateNews).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("renders the RefreshCw icon", () => {
    render(<RefreshButton />);

    const button = screen.getByRole("button", { name: /refresh/i });
    const svg = button.querySelector("svg");
    expect(svg).toBeDefined();
  });

  it("shows 'Loaded just now' initially", () => {
    render(<RefreshButton />);

    expect(screen.getByText("Loaded just now")).toBeDefined();
  });

  it("updates elapsed time after interval", () => {
    render(<RefreshButton />);

    expect(screen.getByText("Loaded just now")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText("Loaded 10s ago")).toBeDefined();
  });

  it("shows minutes for longer elapsed time", () => {
    render(<RefreshButton />);

    act(() => {
      vi.advanceTimersByTime(120000); // 2 minutes
    });

    expect(screen.getByText("Loaded 2m ago")).toBeDefined();
  });

  it("shows hours for very long elapsed time", () => {
    render(<RefreshButton />);

    act(() => {
      vi.advanceTimersByTime(7200000); // 2 hours
    });

    expect(screen.getByText("Loaded 2h ago")).toBeDefined();
  });

  it("resets to 'just now' after refresh", async () => {
    render(<RefreshButton />);

    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds
    });

    expect(screen.getByText("Loaded 30s ago")).toBeDefined();

    const button = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(button);

    // Wait for the async action to complete
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Loaded just now")).toBeDefined();
  });
});
