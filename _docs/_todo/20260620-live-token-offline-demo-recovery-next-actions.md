# 2026-06-20 Todo: Live token offline demo recovery next actions

- [x] Prevent stale offline-demo storage from blocking live employee API reads.
- [x] Prevent stale offline-demo storage from keeping the shell status at `离线` after real backend login.
- [x] Keep explicit demo sessions backend-skipping.
- [ ] Promote this token-aware offline-demo rule to other direct `isOfflineDemoMode()` runtime gates during the next high-leverage feature slice.
- [ ] Add a browser smoke test that seeds stale offline-demo storage before live login and asserts employee API + SignalR are live.
