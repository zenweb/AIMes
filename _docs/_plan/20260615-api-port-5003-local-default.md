# 2026-06-15 API port 5003 local default plan

## Success Criteria

- New AIMes backend/browser/staging runs do not default to host `5000`.
- New local defaults avoid occupied host `5002`.
- Docker, backend, frontend, scripts, and current docs agree on `5003`.
- Backend startup banner fallback and live staging e2e default agree on `5003`.
- Verification proves `5003` is free and Compose publishes `5003:5003`.
- Verification proves current runtime/script/operator entry points no longer default to host `5000` or `5002`.

## Steps

1. Confirm current port occupancy.
2. Update runtime defaults to `5003`.
3. Update copy-pasteable operator docs and script defaults.
4. Verify no current runtime entry point still uses `5000` or `5002`.
5. Record changelog, review, todo, issue, and plan files.
6. Follow up on current-run fallback defaults that still pointed at `5002`.

## Stop Condition

Stop after port-default alignment and static verification. Do not start Docker or staging in this slice.
