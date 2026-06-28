# 2026-06-14 Commitment Chain Post-Schema Browser Recheck

## Changed
- Re-ran focused real-browser OTD KPI commitment chain evidence after expanding `agent_evidence_links.evidence_summary` to `text`.
- Confirmed the frontend Report -> Chat/Scheduling -> Audit commitment flows still pass after the backend persistence schema fix.

## Verification
- `npm run test:e2e -- tests/e2e/report.spec.ts -g "OTD KPI 可生成客户交付恢复承诺包并进入助手与审计|OTD KPI 产品族外协等待可生成外协承诺包并进入排产与审计"` -> Nuxt production build PASS, Chromium 2 passed.
- Backend/staging counterpart remains `_docs/_reports/staging-rehearsal-20260614-commitment-persistence-current.md` -> Result: PASS.

## Notes
- No production code changed in this recheck.
- Gray observation remains owner-deferred/skipped, not strict final PASS.
