# 2026-06-14 Issue - Audit Replay OTD Evidence Mapping

## Issue
- `AuditDecisionReplayPanel.vue` had improved coverage but lacked direct tests for OTD replay chains that carry release-readiness business meaning.
- Without these tests, regressions could flatten customer commitment, outsourcing, and quality-gate evidence into generic replay output.

## Resolution
- Added deterministic OTD evidence-chain records for three representative scenarios.
- Verified that the selected replay details preserve the expected stage, trace ID, source linkage, and downstream safeguard wording.
- Reused the real browser scanner scenario to keep audit replay tied to an actual user workflow.

## Status
- Resolved for this slice.
- No production implementation changes required.
