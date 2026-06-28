# 2026-06-15 API port 5003 local default next actions

- [x] Stop using host `localhost:5000` for new AIMes runs.
- [x] Avoid occupied local host `localhost:5002`.
- [x] Align Docker Compose, Dockerfile, backend launch settings, frontend proxy default, staging scripts, and operator docs on `localhost:5003`.
- [x] Align backend startup banner fallback and live staging e2e default API on `localhost:5003`.
- [x] Verify `5003` is free on the current workstation.
- [x] Verify current runtime/script/operator entry points no longer default to `5000` or `5002`.
- [x] Verify backend build after the port fallback cleanup.
- [ ] When Docker/staging is next exercised, use the new `5003` default and record fresh evidence.
