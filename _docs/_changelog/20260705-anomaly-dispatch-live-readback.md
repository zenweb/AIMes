# 2026-07-05 Changelog: Anomaly Dispatch Live Readback Evidence

## Changed

- Closed the Docker-dependent anomaly-dispatch live API/browser readback todo item.
- Added `_docs/_review/20260705-anomaly-dispatch-live-readback.md` with authenticated API evidence, browser request evidence, response-body readback, screenshot path, and explicit boundaries.
- Added `_docs/_reports/anomaly-dispatch-live-readback-20260705.png` as the sealed browser screenshot artifact.
- Updated `_docs/_todo/20260620-anomaly-dispatch-backend-fail-loud-next-actions.md` to mark the live readback item complete.

## Verification

- `GET http://127.0.0.1:5002/health` returned `200 Healthy`.
- `POST /api/v1/auth/login` succeeded for seeded live backend account `admin/admin123`.
- `POST /api/v1/scheduling/anomaly-dispatch-records` returned `id=live-readback-20260705-codex`.
- `GET /api/v1/scheduling/anomaly-dispatch-records?take=12` returned exactly one matching record.
- Real browser at `http://127.0.0.1:4173/scheduling/anomaly` requested `/api/v1/scheduling/anomaly-dispatch-records?take=12` and received the same record.

## Findings

- Existing `aimes-api` static frontend path returned "frontend not built"; browser evidence therefore used local frontend preview `4173` proxied to live API `5002`.
- SignalR hub negotiate requests still targeted `5003` and failed in the browser console. This did not block REST readback but remains a separate live-browser configuration finding.
