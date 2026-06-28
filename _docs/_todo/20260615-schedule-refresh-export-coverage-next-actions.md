# 2026-06-15 Todo: Schedule refresh and export coverage next actions

- Continue coverage-leverage routing instead of over-polishing one component.
- Candidate next targets from the latest full coverage: `DocumentUpload.vue`, `ChatPanel.vue`, and any ScheduleBoard branch that maps directly to a high-frequency operator workflow.
- Keep export tests payload-oriented: assert filenames, headers, and business rows instead of only checking that a button was clicked.
- Keep refresh/retry tests state-oriented: stale warning/error state must clear only after authoritative reload succeeds.
