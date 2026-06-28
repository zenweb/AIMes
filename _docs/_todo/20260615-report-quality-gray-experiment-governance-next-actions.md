# 2026-06-15 Todo: Report quality gray experiment governance next actions

- `ReportBoard.vue` line coverage is now `93.78%`; stop using it for low-yield micro-slices unless the uncovered line is user-critical.
- Next candidate should be selected by coverage leverage across current low-covered, user-critical components.
- If staying in `ReportBoard`, prefer only high-value remaining user actions such as export failure boundaries or POC generation handlers that are still uncovered.
