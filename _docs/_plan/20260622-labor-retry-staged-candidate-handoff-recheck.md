# 2026-06-22 Plan: Labor retry staged candidate handoff recheck

Success criteria:
- Prove the staged labor retry candidate is still coherent after later documentation and patch-export work.
- Avoid mixing Agent E2E changes into the staged candidate.
- Leave a handoff record that supports either commit, replacement, or further human review.

Steps:
1. Inspect staged file list and staged stats.
2. Re-read existing 20260622 boundary and hunk-map reports.
3. Run cached diff whitespace check.
4. Run focused unit validation.
5. Run focused chromium E2E validation.
6. Record next integration condition for Agent E2E.

Stop condition:
- If staged diff check or focused validation fails, stop and fix the staged labor retry candidate before touching Agent E2E integration.
