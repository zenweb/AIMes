# 2026-06-15 Issue: stale actionable host port examples

## Problem
- A few review/todo files still contained copy-pasteable live staging examples using host `localhost:5000`.
- A few current operator-facing V1 instructions still told users to open `http://localhost:5000`.

## Impact
- Future manual or browser evidence runs could accidentally target the old host backend port and collide with local services.

## Resolution
- Updated actionable examples to host `localhost:5002`.
- Updated current V1 checklist/marketing quick-start URLs to host `localhost:5002`.
- Removed the active container-internal API listener on `5000`; historical reports remain unchanged.
