# 2026-06-22 Plan: Employee live login database credential recovery

Success criteria:
- Backend remains on non-5000 port.
- Login through preview uses live backend, not offline demo.
- Employee page loads without surfacing offline demo skip text.
- Existing staged release candidate remains untouched.

Steps:
1. Confirm frontend/backend listeners.
2. Confirm `/api/v1/employee` reaches backend and fails only because auth is missing.
3. Inspect current Docker PostgreSQL `system_users` rows without reading password hashes.
4. Restore local demo credentials for live verification.
5. Validate with real browser using `offlineDemo=0`.

Stop condition:
- If login still failed after credential recovery, stop and report database/auth mismatch instead of trying random credentials.

Follow-up recheck criteria:
- Direct API evidence must show backend 5003 returns employee rows after login.
- Browser evidence must show 4173 uses `aimes_offline_demo=false` and renders the same row set as the backend.
- If the user still sees fallback, route them through `login?offlineDemo=0` before changing source code.
