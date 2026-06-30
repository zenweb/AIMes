# 2026-06-30 Live Staging Full E2E No-Skip Closure

## Changed

- 将 Employee live backend E2E 改为测试内部只转发 `auth/login` 与 `employee` API 到 `AIMES_LIVE_API_BASE_URL`。
- 避免用全局 `VITE_API_TARGET` 影响整套离线演示 E2E。
- 更新 `scripts/run-employee-live-backend-evidence.ps1`，支持 `-ApiBaseUrl` 并改用 `AIMES_LIVE_API_BASE_URL`。
- 将 Docker Compose API 暴露到宿主 `5002`，用于 live staging 验证。
- 对齐 `ReportBoard` / `ScannerBoard` unit guard：报表 fail-loud 断言覆盖 API 来源提示，扫码跳转测试 mock 新增 `isOfflineDemoMode`。

## Verified

- API health：`http://127.0.0.1:5002/health` -> `200 Healthy`。
- PostgreSQL probe：`mes|7`。
- Scheduling live staging 聚焦 E2E：2 passed。
- Employee live backend 聚焦 E2E：1 passed，0 flaky。
- Employee live backend evidence script：exit code 0，产出 `_docs/_reports/employee-live-backend-evidence-20260630-5002-current.md`。
- Quality 污染回归聚焦 E2E：1 passed。
- Full E2E with live switches：390 passed / 0 skipped / 0 failed，耗时 7.9 分钟。
- Frontend lint：passed。
- Frontend unit：118 files / 1255 tests passed。
- Release gate audit：exit code 0，`PASS_WITH_DEFERRED_GRAY_OBSERVATION`，产出 `_docs/_reports/release-gate-audit-20260630-live-e2e-no-skip-deferred-gray.md`。

## Notes

- 灰度观察没有在此工作中完成；该项仍属于独立发布轨道。
