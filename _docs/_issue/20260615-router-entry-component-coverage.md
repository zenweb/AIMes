# 2026-06-15 Issue: Router lazy-entry coverage gap

Issue:
- `src/router/index.ts` had low focused function and line coverage because many registered lazy component loaders were never executed by unit tests.
- The existing guard tests verified access control but did not prove every registered route target remained resolvable.

Impact:
- A route could be renamed, removed, or pointed at the wrong component path without a focused router test failing.
- Since routing is a user entry path, this gap had higher leverage than further polishing already-cleared components.

Resolution:
- Added a route manifest test that enumerates all workbench paths and resolves each lazy default component.
- Focused router coverage is now 100% across statements, branches, functions, and lines.

Status:
- Resolved for this slice.
- Real-browser navigation evidence remains a separate validation track.
