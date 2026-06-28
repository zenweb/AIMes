# 2026-06-20 Review: Assistant Engineering Constraint Backend Partial Fallback

## Scope
- Reviewed assistant engineering constraint package backend-first reads.
- Focused on preventing partial backend audit evidence from polluting the existing engineering constraint workflow.

## Findings
- No blocking issue found in the targeted change.
- The fix reuses the existing completeness guard instead of creating a parallel backend schema.
- Non-array backend payloads now fail loud when requested and otherwise fall back to local complete evidence.
- Partial backend records are ignored before merge, so local complete packages keep their BOM, route, quality gate, scheduling, and OTD context.

## Residual Risk
- This is targeted validation, not a full frontend regression.
- The first audit replay filter attempted for engineering-specific text matched no tests; a wider audit replay evidence filter was run and is recorded separately.
- Strict final release status remains outside this slice because gray observation is still a separate release gate.
