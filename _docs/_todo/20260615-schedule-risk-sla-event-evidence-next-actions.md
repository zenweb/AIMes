# 2026-06-15 Todo: Schedule risk SLA event evidence next actions

- Do not keep micro-slicing `ScheduleBoard` unless the next uncovered branch is clearly user-critical.
- Reuse the full coverage baseline to select the next target.
- Current high-leverage candidates include:
  - `PurchaseBoard.vue` lines `78.5%`, functions `58.75%`.
  - `BomBoard.vue` lines `79.66%`, branches `59%`.
  - `AnomalyBoard.vue` lines `77.64%`, functions `64.58%`.
  - `AdminBoard.vue` branches `37.95%` if admin startup/config paths are currently release-critical.
