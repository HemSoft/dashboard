import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  getPullRequests: vi.fn(),
}));

describe("PRWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders widget with accounts", async () => {
    const { getPullRequests } = await import("../actions");
    vi.mocked(getPullRequests).mockResolvedValue({
      accounts: [
        {
          account: {
            id: "acc-1",
            userId: "user-123",
            githubUserId: 12345,
            githubUsername: "testuser",
            avatarUrl: null,
            accountLabel: "Personal",
            createdAt: new Date(),
          },
          categories: [
            { category: "review-requested", label: "Waiting For My Review", items: [] },
            { category: "created", label: "Created By Me", items: [] },
            { category: "all-open", label: "All Open", items: [] },
          ],
        },
      ],
      errors: [],
    });

    const { PRWidget } = await import("./pr-widget");
    const Component = await PRWidget();
    render(Component);

    expect(screen.getByText("Pull Requests")).toBeDefined();
    expect(screen.getByText("GitHub PRs across your accounts")).toBeDefined();
    expect(screen.getByText("Personal")).toBeDefined();
  });

  it("shows PR count badge when PRs exist", async () => {
    const { getPullRequests } = await import("../actions");
    vi.mocked(getPullRequests).mockResolvedValue({
      accounts: [
        {
          account: {
            id: "acc-1",
            userId: "user-123",
            githubUserId: 12345,
            githubUsername: "testuser",
            avatarUrl: null,
            accountLabel: "Personal",
            createdAt: new Date(),
          },
          categories: [
            {
              category: "review-requested",
              label: "Waiting For My Review",
              items: [
                {
                  id: 1,
                  number: 101,
                  title: "Fix bug",
                  htmlUrl: "https://github.com/org/repo/pull/101",
                  state: "open" as const,
                  draft: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  repository: { fullName: "org/repo", htmlUrl: "https://github.com/org/repo" },
                  user: { login: "author", avatarUrl: "https://example.com/avatar.png" },
                  labels: [],
                },
              ],
            },
            {
              category: "created",
              label: "Created By Me",
              items: [
                {
                  id: 2,
                  number: 102,
                  title: "Add feature",
                  htmlUrl: "https://github.com/org/repo/pull/102",
                  state: "open" as const,
                  draft: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  repository: { fullName: "org/repo", htmlUrl: "https://github.com/org/repo" },
                  user: { login: "testuser", avatarUrl: "https://example.com/avatar.png" },
                  labels: [],
                },
              ],
            },
            { category: "all-open", label: "All Open", items: [] },
          ],
        },
      ],
      errors: [],
    });

    const { PRWidget } = await import("./pr-widget");
    const Component = await PRWidget();
    render(Component);

    // Badge should show 2 total PRs (the badge next to the title in the header)
    const cardTitle = screen.getByText("Pull Requests");
    const badge = cardTitle.parentElement?.querySelector("[data-slot='badge']");
    expect(badge?.textContent).toBe("2");
  });

  it("shows connect button when no accounts", async () => {
    const { getPullRequests } = await import("../actions");
    vi.mocked(getPullRequests).mockResolvedValue({
      accounts: [],
      errors: [],
    });

    const { PRWidget } = await import("./pr-widget");
    const Component = await PRWidget();
    render(Component);

    expect(screen.getByText("No GitHub accounts connected")).toBeDefined();
    expect(screen.getByRole("link", { name: "Connect Account" })).toBeDefined();
  });

  it("shows error indicator when errors present", async () => {
    const { getPullRequests } = await import("../actions");
    vi.mocked(getPullRequests).mockResolvedValue({
      accounts: [],
      errors: [{ accountId: "acc-1", message: "Token expired" }],
    });

    const { PRWidget } = await import("./pr-widget");
    const Component = await PRWidget();
    render(Component);

    expect(screen.getByText("1 account(s) failed to load")).toBeDefined();
  });

  it("has view all link", async () => {
    const { getPullRequests } = await import("../actions");
    vi.mocked(getPullRequests).mockResolvedValue({
      accounts: [],
      errors: [],
    });

    const { PRWidget } = await import("./pr-widget");
    const Component = await PRWidget();
    render(Component);

    const viewAllLink = screen.getByRole("link", { name: "View All" });
    expect(viewAllLink.getAttribute("href")).toBe("/prs");
  });
});
