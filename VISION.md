# Dashboard Vision

## Core Concept

The dashboard is a **unified command center** for monitoring and interacting with various services, tools, and workflows. Each feature exists in two forms:

| Term | Description |
|------|-------------|
| **Widget** | Compact card on the dashboard showing a summary/preview |
| **Page** | Full-screen dedicated view with complete functionality |

## Feature Categories

### 1. Insights (Informational)

Read-only features that surface information from external sources.

| Feature | Status | Description | Data Sources |
|---------|--------|-------------|--------------|
| News | ✅ Complete | Aggregated news/updates | RSS feeds |
| PR Status | ✅ Complete | Pull request activity | GitHub API |
| Usage | Planned | Resource consumption stats | Supabase, Vercel, GitHub Copilot, OpenRouter |
| Notifications | Planned | System alerts | Windows, custom |
| Mail | Planned | Email summaries | Outlook, Gmail |

### 2. Actions (Utilities)

Interactive features that trigger operations or workflows.

| Feature | Status | Description | Capabilities |
|---------|--------|-------------|--------------|
| Agent Runner | Planned | Trigger agentic workflows | Custom automation |
| AI Chat | Planned | Conversational interface | OpenAI, Anthropic |
| Quick Actions | Planned | One-click operations | Various integrations |

## Vocabulary

| Term | Definition |
|------|------------|
| **Widget** | A compact, dashboard-mounted component showing summarized data |
| **Page** | A dedicated route with the full feature experience |
| **Insight** | An informational feature (read-only) |
| **Action** | A utility feature (interactive/mutating) |
| **Module** | A complete feature encompassing both widget and page |

## Architecture Pattern

Each **Module** consists of:

```
src/
  modules/
    <module-name>/           # Module directory
      components/
        <name>-widget.tsx    # Widget component
        <name>-item.tsx      # Item component
      actions.ts             # Server actions
      types.ts               # TypeScript types
      lib/                   # Module-specific utilities
  app/
    <module-name>/
      page.tsx               # Full page route
```

The dashboard home page imports and renders widgets from each module.

## Implementation Roadmap

### Phase 1: Foundation ✅
- [x] Establish module structure
- [x] Create base UI components (Card, Button, Badge, etc.)
- [x] Define shared types for widgets
- [x] Set up theming system (4 themes: default, ocean, forest, sunset)
- [x] Implement Supabase authentication
- [x] Configure 100% test coverage requirement

### Phase 2: News Module ✅
- [x] News widget (dashboard card)
- [x] News page (full view at `/news`)
- [x] RSS feed parsing with real data sources
- [x] News item components
- [x] Refresh functionality

### Phase 3: GitHub PRs Module ✅
- [x] PR widget (dashboard card)
- [x] PR page (full view at `/prs`)
- [x] GitHub API integration
- [x] PR tree view (grouped by repository)
- [x] PR item components

### Phase 4: Additional Modules
- [ ] Usage stats module
- [ ] Notifications module
- [ ] Mail module

## Design Principles

1. **Progressive Disclosure**: Widgets show essentials; pages reveal details
2. **Consistency**: All modules follow the same structure
3. **Independence**: Modules are self-contained and can be enabled/disabled
4. **Real-time Ready**: Architecture supports live updates via Supabase Realtime or polling
5. **100% Test Coverage**: All code must have complete test coverage

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Frontend | Next.js 16+ (App Router) |
| UI | shadcn/ui + Tailwind CSS 4 |
| Database/Auth | Supabase Cloud |
| Deployment | Vercel |
| Testing | Vitest + Testing Library |

## Current Status

- **Modules Complete**: 2 (News, GitHub PRs)
- **Test Coverage**: 100%
- **Themes Available**: 4 (default, ocean, forest, sunset)
- **Active Routes**: `/`, `/news`, `/prs`, `/login`, `/signup`, `/account`

---

*Last updated: 2025-12-22*
