# 2026-07-05 Gray evidence request repo-local wording

- Updated the gray monitoring evidence request to reject external-only ticket IDs, dashboard URLs, or prose for strict PASS.
- Updated the release human action packet so `IncidentQueryEvidence` explicitly means repo-local `_docs/` or `output/` evidence.
- Added architecture guard tokens for the repo-local wording.

Strict v1.0.0 remains blocked until real repo-local gray monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
- Fixed follow-up CI wording mismatch so the release human action packet matches the architecture guard token exactly.
