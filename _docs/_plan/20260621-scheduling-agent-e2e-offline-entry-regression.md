# Scheduling Agent E2E offline entry regression plan

## Success Criteria

- Agent backend API E2E cases do not enter offline demo skip mode.
- Agent backend success, 403 fallback, and API-unavailable fallback scenarios pass in Chromium.
- The fix remains scoped to Agent E2E routing/mocking and does not broaden the release claim to full scheduling E2E.

## Execution

1. Route Agent backend API test titles to live-backend-mock mode in the E2E runner.
2. Enter scheduling with `offlineDemo=0` for those cases.
3. Mock scheduling first-screen APIs before page entry so unrelated startup reads do not redirect to login.
4. Keep Agent-specific recommend/adopt routes controlled by `mockAgentApi`.
5. Rerun focused Agent subsets.

## Result

The focused Agent Workbench subset is green: 5/5 passed. Full scheduling E2E remains unclaimed.
