# Project Protocol: Dashboard

This project follows the **StackProbe** protocol. All agents and contributors must adhere to these standards.

## Quality Standards
- **Clean Lint Requirement**: ALL changes must result in a clean `bun lint` result. No code should be committed unless linting passes with zero errors and zero warnings.
- **Test Coverage**: New features must include tests. Maintain 90% coverage.
- **Type Safety**: Strict TypeScript mode is enabled. No `any` types allowed.

## Visual System: "Finesse"
- **Theme**: Mesh/Grid/Glass aesthetic.
- **Colors**: OKLCH-based color system.
- **Components**: shadcn/ui (Tailwind CSS 4).
- **Layout**: Responsive, mobile-first, with subtle glassmorphism effects.

## Tech Stack
- **Runtime**: Bun
- **Frontend**: Next.js 16+ (App Router)
- **Database/Auth**: Supabase Cloud
- **Deployment**: Vercel

## Agentic Workflow
- **Plan-First**: Always present a plan before making modifications.
- **Consent**: Wait for explicit user approval before executing non-trivial tool calls.
- **Non-Interactive**: Use non-interactive flags for all CLI commands (e.g., `--yes`).
