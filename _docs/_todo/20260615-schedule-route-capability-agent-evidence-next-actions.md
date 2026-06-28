# 2026-06-15 Next Actions - ScheduleBoard 工艺能力 Agent 采纳证据

- Continue `ScheduleBoard` only while each slice adds meaningful business proof; avoid coverage-only micro-slices.
- Good next candidates: quality gate release suggestion, labor qualification block suggestion, production completion suggestion, or route released-state suggestion.
- Reattempt live browser staging only after:
  - Docker Desktop Linux engine returns Server OK.
  - Host `5002` is free, or a non-5000 API override such as `http://localhost:5003` is explicitly used.
- Keep new runtime/browser evidence away from host `localhost:5000`.
