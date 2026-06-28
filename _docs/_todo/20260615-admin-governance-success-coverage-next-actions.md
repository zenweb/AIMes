# 2026-06-15 Todo: Admin governance success-path coverage next actions

- Continue routing by coverage leverage: prioritize the next low-coverage, user-critical existing component before adding new features.
- Candidate next targets from the latest full coverage include `ScheduleBoard.vue`, `DocumentUpload.vue`, `ChatPanel.vue`, or any AdminBoard subpath only if it remains the strongest user-critical gap.
- Keep success-path tests focused on backend-authority refresh after writes, especially for governance actions where stale local state would mislead operators.
- Do not treat this unit slice as release-gate completion; real browser evidence and staging evidence remain separate tracks.
