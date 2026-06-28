# 2026-06-20 Todo: OTD KPI Commitment Backend Fail Loud Next Actions

## Done
- OTD KPI commitment API reads now support fail-loud behavior.
- Backend-first list reads now validate payload shape.
- Latest backend reads now require complete commitment records before replacing local evidence.
- Targeted and adjacent tests passed.

## Next
- Continue the CC remediation loop by selecting the next existing user-critical backend-first evidence path with weak fail-loud or payload-shape handling.
- Keep prioritizing existing feature depth and audit correctness over new scope.
- Continue reporting filtered test counts explicitly.

## Watch
- Do not treat this slice as a full frontend regression.
- Do not mark strict v1.0.0 complete until final release gates are proved or explicitly waived in authoritative release evidence.
