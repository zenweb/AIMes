# AIMes Final Release Notes

> Date: 2026-05-27  
> Release theme: demoable AI MES to traceable AI MES  
> Status: ready for professional demo and acceptance review

## Summary

This release turns AIMes into a coherent professional MES demo focused on traceability:

- Backend decisions and actions are represented as auditable evidence.
- Agent recommendations are permission-gated before adoption.
- Cross-domain actions can write business evidence.
- Audit replay can reconstruct the chain and deep-link to affected business objects.
- Dashboard, Scheduling, Audit, and Report now form a polished four-page executive demo path.

## What Changed

### Professional MES UI

- Added a professional app shell with factory context, module context, operation ribbon, and evidence status.
- Refined Dashboard, Scheduling, Audit Replay, and Report with page-specific workbench/hero surfaces.
- Refreshed clean visual evidence screenshots under `_docs/_review/ui-professional-smoke-round2/`.
- Added HTML design documentation with screenshot previews.

### Evidence And Audit

- Consolidated backend evidence APIs across OTD, equipment, shortage, supply, outsourcing, quality, engineering, risk, assistant, POC, knowledge, execution, governance, and KPI commitment surfaces.
- Added backend-first reads and best-effort writes across frontend modules.
- Strengthened Audit replay around Agent execute business writes.

### Demo Asset Honesty

- A/B numbers are sourced from the real .NET harness output.
- Current canonical result: WeightedComposite `26.67%` to Agent `30.00%`, delta `+3.33pt`, p=`0.7745`.
- The release keeps significance honest: the current 30-order sample is not statistically significant at 95%.

### Test And Stability

- Fixed the e2e/offline-mode boundary so visual demo mode does not break Playwright mock backend tests.
- Fixed `GetAllPlans_Performance` to measure steady-state request latency after warmup.
- Confirmed backend full tests and four-page frontend e2e pass.

## Verification

| Command | Result |
|---|---:|
| `VITE_OFFLINE_DEMO=true npm run test:e2e -- dashboard.spec.ts scheduling.spec.ts audit.spec.ts report.spec.ts` | `62/62` passed |
| `dotnet test src/backend/AIMes.slnx --filter "FullyQualifiedName~PerformanceTests.GetAllPlans_Performance"` | `1/1` passed |
| `dotnet test src/backend/AIMes.slnx` | Unit `308/308`, Integration `138/138` passed |
| `git diff --check` | Passed with CRLF warnings only |

## Deliverables

- Final acceptance overview: `_docs/_review/20260527-final-acceptance-overview.md`
- Final demo runbook: `_docs/_marketing/20260527-final-demo-runbook.md`
- Final release notes: `_docs/_reports/20260527-final-release-notes.md`
- Final quality gate review: `_docs/_review/20260526-ultragoal-final-quality-gate-review.md`
- Design document: `_docs/_design/20260526-aimes-professional-mes-ui-system.html`
- Changelog: `_docs/_changelog/20260527-final-delivery-package.md`

## Known Limitations

- OMX still reports the durable G001 story as `in_progress` because this Codex App session lacks the required Codex goal snapshot tooling for final `get_goal` / `update_goal` / checkpoint reconciliation.
- No synthetic OMX complete state was written. The limitation is documented in the ledger, final quality gate JSON, and final review.
- The final MP4 recording is not generated locally; the runbook provides the canonical script and proof path for external recording.

## Acceptance Statement

AIMes is accepted as a professional demo package for an auditable AI MES. It demonstrates the business loop from delivery risk to Agent recommendation, human decision, persisted action, audit replay, and executive review.

