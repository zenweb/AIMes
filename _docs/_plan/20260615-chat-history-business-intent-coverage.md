# 2026-06-15 Plan: Chat history and business-intent coverage

Success criteria:
- Cover ChatPanel history restoration when the assistant panel becomes visible.
- Cover prompt send guards for whitespace input and duplicate submit while a query is loading.
- Cover offline business-intent answers for user-critical paths without adding production scope.
- Raise focused ChatPanel line coverage above 80%.
- Verify focused and full frontend unit coverage.

Execution:
1. Inspect existing ChatPanel tests, component behavior, and focused coverage gaps.
2. Add history restoration and send-guard tests.
3. Recheck focused coverage and identify remaining high-leverage uncovered functions.
4. Add offline business-intent tests for BOM kitting, engineering/route capability, top rush-order risks, and anomaly dispatch.
5. Run focused unit, focused coverage, and full frontend coverage.

Outcome:
- Completed for this slice. ChatPanel focused coverage reached statements 83.85%, branches 76.46%, functions 83.76%, lines 84.32%.
- Full frontend unit coverage passed with 111 files and 918 tests.
- Next work should move to another low-coverage user-critical component instead of continuing ChatPanel micro-polish.
