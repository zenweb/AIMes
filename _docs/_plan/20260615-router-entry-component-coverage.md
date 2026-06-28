# 2026-06-15 Plan: Router entry component coverage

Success criteria:
- Preserve existing auth guard behavior.
- Prove every registered workbench route path is present.
- Prove every non-redirect route resolves its lazy-loaded component.
- Raise focused router coverage above the 80% threshold.
- Verify focused and full frontend unit coverage.

Execution:
1. Inspect current router definitions, router-auth tests, and focused router coverage.
2. Add a test that asserts the route manifest and resolves each registered lazy component.
3. Run focused router unit tests.
4. Run focused router coverage.
5. Run full frontend unit coverage.

Outcome:
- Completed for this slice. Focused router coverage reached 100% statements, branches, functions, and lines.
- Full frontend unit coverage passed with 111 files and 919 tests.
- Next work should move to another low-coverage user-critical component instead of continuing router micro-polish.
