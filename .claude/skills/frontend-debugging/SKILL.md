---
name: frontend-debugging
description: Expert guidance for debugging Next.js, React, and Playwright applications with modern tools and best practices.
---

# Frontend Debugging

Use this skill when you need to troubleshoot UI issues, state management bugs, or test failures in a Next.js/React environment.

## Next.js Debugging

### Server-Side Debugging
- **Inspect Flag**: Run `bun dev --inspect` to enable the Node.js inspector.
- **VS Code**: Use the "Next.js: debug server-side" configuration in `launch.json`.
- **Chrome**: Navigate to `chrome://inspect` to attach to the server process.

### Client-Side Debugging
- **Browser DevTools**: Use the Sources tab (Chrome) or Debugger tab (Firefox).
- **React DevTools**: Use the Components and Profiler tabs to inspect state and props.
- **Breakpoints**: Use `debugger;` statements in code or set breakpoints in DevTools.

## Playwright Debugging

### Interactive Debugging
- **Inspector**: Run `npx playwright test --debug` to open the Playwright Inspector.
- **Manual Pause**: Insert `await page.pause()` in your test to stop execution and inspect the page.
- **Headed Mode**: Use `--headed` to see the browser during execution.

### Post-Mortem Analysis
- **Trace Viewer**: Record traces with `trace: 'on'` in config and view them with `npx playwright show-trace {path-to-trace}`.
- **Actionability Logs**: Check the logs in the Inspector to see why an action (like a click) failed.

## Best Practices
1. **Source Maps**: Ensure `productionBrowserSourceMaps: true` is set in `next.config.ts` if debugging production builds.
2. **Console Logging**: Use `console.log` sparingly; prefer breakpoints for complex state inspection.
3. **Network Tab**: Monitor API calls and responses to identify backend integration issues.
4. **Fast Refresh**: Be aware that Fast Refresh might clear local state; use persistent storage or URL state for critical data.
