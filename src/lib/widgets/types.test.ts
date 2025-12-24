import { GitPullRequest, Newspaper, Wallet } from "lucide-react";
import { describe, expect, it } from "vitest";
import {
    getDefaultWidgetSettings,
    getEnabledWidgets,
    mergeWidgetSettings,
    reorderWidgets,
    toggleWidget,
    type WidgetDefinition,
    type WidgetId,
    type WidgetSettings,
} from "./types";

const mockWidgets: WidgetDefinition[] = [
  {
    id: "pull-requests",
    name: "Pull Requests",
    description: "GitHub PRs",
    icon: GitPullRequest,
    defaultEnabled: true,
  },
  {
    id: "news",
    name: "News",
    description: "Latest news",
    icon: Newspaper,
    defaultEnabled: true,
  },
  {
    id: "expenditures",
    name: "Expenditures",
    description: "Track costs",
    icon: Wallet,
    requiresAdmin: true,
    defaultEnabled: true,
  },
];

describe("getDefaultWidgetSettings", () => {
  it("creates settings with all widgets enabled in order", () => {
    const result = getDefaultWidgetSettings(mockWidgets);

    expect(result.widgets).toHaveLength(3);
    expect(result.widgets[0]).toEqual({
      id: "pull-requests",
      enabled: true,
      order: 0,
    });
    expect(result.widgets[1]).toEqual({
      id: "news",
      enabled: true,
      order: 1,
    });
    expect(result.widgets[2]).toEqual({
      id: "expenditures",
      enabled: true,
      order: 2,
    });
  });

  it("handles empty widget list", () => {
    const result = getDefaultWidgetSettings([]);
    expect(result.widgets).toHaveLength(0);
  });
});

describe("mergeWidgetSettings", () => {
  it("returns defaults when user settings is null", () => {
    const result = mergeWidgetSettings(null, mockWidgets);

    expect(result.widgets).toHaveLength(3);
    expect(result.widgets.every((w) => w.enabled)).toBe(true);
  });

  it("preserves user settings and adds new widgets", () => {
    const userSettings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: false, order: 1 },
        { id: "news", enabled: true, order: 0 },
      ],
    };

    const result = mergeWidgetSettings(userSettings, mockWidgets);

    expect(result.widgets).toHaveLength(3);
    // Existing widgets keep their settings
    const prWidget = result.widgets.find((w) => w.id === "pull-requests");
    expect(prWidget?.enabled).toBe(false);
    expect(prWidget?.order).toBe(1);

    // New widget added with default settings
    const expendWidget = result.widgets.find((w) => w.id === "expenditures");
    expect(expendWidget?.enabled).toBe(true);
    expect(expendWidget?.order).toBe(2); // Added at the end
  });

  it("removes widgets that no longer exist in registry", () => {
    const userSettings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: true, order: 0 },
        { id: "old-widget" as WidgetId, enabled: true, order: 1 },
      ],
    };

    const limitedWidgets = [mockWidgets[0]]; // Only pull-requests
    const result = mergeWidgetSettings(userSettings, limitedWidgets);

    expect(result.widgets).toHaveLength(1);
    expect(result.widgets[0].id).toBe("pull-requests");
  });

  it("sorts merged widgets by order", () => {
    const userSettings: WidgetSettings = {
      widgets: [
        { id: "news", enabled: true, order: 2 },
        { id: "pull-requests", enabled: true, order: 0 },
      ],
    };

    const result = mergeWidgetSettings(userSettings, mockWidgets.slice(0, 2));

    expect(result.widgets[0].id).toBe("pull-requests");
    expect(result.widgets[1].id).toBe("news");
  });
});

describe("getEnabledWidgets", () => {
  it("returns only enabled widgets sorted by order", () => {
    const settings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: false, order: 0 },
        { id: "news", enabled: true, order: 2 },
        { id: "expenditures", enabled: true, order: 1 },
      ],
    };

    const result = getEnabledWidgets(settings);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("expenditures");
    expect(result[1].id).toBe("news");
  });

  it("returns empty array when no widgets enabled", () => {
    const settings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: false, order: 0 },
        { id: "news", enabled: false, order: 1 },
      ],
    };

    expect(getEnabledWidgets(settings)).toHaveLength(0);
  });
});

describe("toggleWidget", () => {
  it("toggles a widget enabled state", () => {
    const settings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: true, order: 0 },
        { id: "news", enabled: true, order: 1 },
      ],
    };

    const result = toggleWidget(settings, "pull-requests", false);

    expect(result.widgets[0].enabled).toBe(false);
    expect(result.widgets[1].enabled).toBe(true);
  });

  it("leaves other widgets unchanged", () => {
    const settings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: true, order: 0 },
        { id: "news", enabled: false, order: 1 },
      ],
    };

    const result = toggleWidget(settings, "news", true);

    expect(result.widgets[0].enabled).toBe(true);
    expect(result.widgets[1].enabled).toBe(true);
  });
});

describe("reorderWidgets", () => {
  it("updates widget order based on new order array", () => {
    const settings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: true, order: 0 },
        { id: "news", enabled: true, order: 1 },
        { id: "expenditures", enabled: true, order: 2 },
      ],
    };

    const newOrder: WidgetId[] = ["news", "expenditures", "pull-requests"];
    const result = reorderWidgets(settings, newOrder);

    expect(result.widgets.find((w) => w.id === "news")?.order).toBe(0);
    expect(result.widgets.find((w) => w.id === "expenditures")?.order).toBe(1);
    expect(result.widgets.find((w) => w.id === "pull-requests")?.order).toBe(2);
  });

  it("preserves original order for widgets not in new order array", () => {
    const settings: WidgetSettings = {
      widgets: [
        { id: "pull-requests", enabled: true, order: 0 },
        { id: "news", enabled: true, order: 1 },
        { id: "expenditures", enabled: true, order: 2 },
      ],
    };

    const partialOrder: WidgetId[] = ["news", "pull-requests"];
    const result = reorderWidgets(settings, partialOrder);

    expect(result.widgets.find((w) => w.id === "expenditures")?.order).toBe(2);
  });
});
