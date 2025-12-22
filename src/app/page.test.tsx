import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        }),
      },
    })
  ),
}));

vi.mock("@/modules/news", () => ({
  NewsWidget: () => <div data-testid="news-widget">News Widget</div>,
}));

vi.mock("@/modules/github-prs", () => ({
  PRWidget: () => <div data-testid="pr-widget">PR Widget</div>,
}));

vi.mock("@/modules/expenditures", () => ({
  ExpendituresWidget: () => (
    <div data-testid="expenditures-widget">Expenditures Widget</div>
  ),
}));

describe("Home Page", () => {
  it("renders the dashboard with widgets when authenticated", async () => {
    const Page = await Home();
    render(Page);

    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Your personal dashboard overview.")).toBeDefined();
    expect(screen.getByTestId("news-widget")).toBeDefined();
    expect(screen.getByTestId("pr-widget")).toBeDefined();
    expect(screen.getByTestId("expenditures-widget")).toBeDefined();
  });
});
