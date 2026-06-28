# 2026-06-15 Task Hold On Archival Next Actions

- [ ] Do not continue implementation while task status is `hold_on`.
- [ ] On resume, start by re-reading `_docs/_review/20260615-task-hold-on-archival.md`.
- [ ] Re-read `.omx/state/task-hold-on.json`.
- [ ] Re-run the current audit replay targeted baseline before making new code changes.
- [ ] Continue from `AuditDecisionReplayPanel.vue` only if the owner still wants the boutique coverage-hardening track.
- [ ] For the next slice, inspect remaining low-coverage replay branches before editing production code; known candidates include POC evidence governance catch, backend business-write outer catch, and schedule feedback outer catch.
- [ ] Keep backend/staging work off port `5000`; prefer `5003`.
- [ ] Do not claim v1.0.0 strict release readiness while gray observation remains owner-deferred.
- [ ] If owner continues to skip gray observation, label the state as continuation-ready rather than strict release PASS.
