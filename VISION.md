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

| Feature | Description | Data Sources |
|---------|-------------|--------------|
| News | Aggregated news/updates | RSS, APIs |
| Usage | Resource consumption stats | Supabase, Vercel, GitHub Copilot, OpenRouter |
| PR Status | Pull request activity | GitHub |
| Notifications | System alerts | Windows, custom |
| Mail | Email summaries | Outlook, Gmail |

### 2. Actions (Utilities)

Interactive features that trigger operations or workflows.

| Feature | Description | Capabilities |
|---------|-------------|--------------|
| Agent Runner | Trigger agentic workflows | Custom automation |
| AI Chat | Conversational interface | OpenAI, Anthropic |
| Quick Actions | One-click operations | Various integrations |

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
    news/                    # Module directory
      components/
        news-widget.tsx      # Widget component
        news-list.tsx        # Shared list component
        news-item.tsx        # Shared item component
      page.tsx               # Full page (/news route)
      actions.ts             # Server actions
      types.ts               # TypeScript types
```

The dashboard home page imports and renders widgets from each module.

## Implementation Roadmap

### Phase 1: Foundation
- [ ] Establish module structure
- [ ] Create base widget component/pattern
- [ ] Define shared types for widgets

### Phase 2: News Module (First Module)
- [ ] News widget (dashboard card)
- [ ] News page (full view at `/news`)
- [ ] Mock data for initial development
- [ ] Wire up real data sources later (RSS, APIs)

### Phase 3: Additional Modules
- [ ] Usage stats module
- [ ] PR status module
- [ ] Additional modules as needed

## Design Principles

1. **Progressive Disclosure**: Widgets show essentials; pages reveal details
2. **Consistency**: All modules follow the same structure
3. **Independence**: Modules are self-contained and can be enabled/disabled
4. **Real-time Ready**: Architecture supports live updates via Supabase Realtime or polling

## Next Steps

1. **Create the module structure** under `src/modules/`
2. **Build a base `Widget` component** in `src/components/ui/` that provides the card shell
3. **Implement the News module** as the reference implementation
4. **Refactor the existing "Recent Records" card** to follow the widget pattern

---

*Last updated: 2025-12-21*
