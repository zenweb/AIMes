# 2026-06-20 Review - Engineering evidence fail-loud readback

## Scope
- Frontend engineering evidence readback for BOM, route capability, and scheduling-adjacent audit trails.

## Findings
- No open findings for this slice.
- Previous behavior allowed alternate material and ECN impact reads to silently fall back to local evidence even when the caller needed backend readback failure to be visible.

## Resolution
- Matched alternate material and ECN latest reads to the existing route capability `failLoud` pattern.
- Kept default optional reads quiet so demo/local fallback workflows continue to work.

## Evidence
- Red-first tests reproduced hidden backend failures.
- Focused and adjacent tests passed.
- Production build passed.

## Residual risk
- This slice does not change current UI callers to request `failLoud`; it enables audit-grade callers to do so without weakening default UX fallback.
