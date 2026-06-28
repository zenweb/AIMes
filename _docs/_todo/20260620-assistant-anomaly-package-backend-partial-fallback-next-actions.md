# 2026-06-20 Todo: Assistant Anomaly Package Backend Partial Fallback Next Actions

## Done
- Assistant anomaly package backend reads now support fail-loud behavior.
- Backend-first anomaly package reads now validate payload shape.
- Partial backend package records are filtered before merge.
- Targeted and adjacent tests passed.

## Next
- Continue the CC remediation loop by hardening the next user-critical backend-first evidence path with weak payload validation.
- Prefer existing feature depth and audit correctness over new feature scope.
- Keep reporting filtered test counts explicitly.

## Watch
- Do not treat this slice as a full frontend regression.
- Do not mark strict v1.0.0 complete until remaining release gates are proved or explicitly waived in authoritative release evidence.
