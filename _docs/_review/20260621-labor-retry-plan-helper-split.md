# Review - Labor Retry Plan Helper Split

The labor retry E2E path no longer depends on the dhtmlx-specific plan helper.

Evidence:

- `mockSchedulingPlanApis(page)` remains available for `真实 dhtmlx` tests.
- `人员证据启动读取失败后可重试` now calls `mockLaborRetrySchedulingPlanApis(page)`.
- The focused Chromium E2E passed 1/1 after the split.

Remaining risk:

- The overall working candidate is still mixed with unrelated real dhtmlx, multi-objective, assistant engineering, and guidance-link changes. This helper split reduces one dependency problem but does not make the full working diff stageable.

