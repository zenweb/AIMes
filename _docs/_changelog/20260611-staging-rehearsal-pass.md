# 2026-06-11 PostgreSQL/Staging Rehearsal PASS

## 变更

- 刷新 Docker Desktop/Linux Engine 可用性证据。
- 运行 staging rehearsal：启动 PostgreSQL、Redis、RabbitMQ、Qdrant 和 API。
- 运行 EF migrations，并确认数据库已经是最新 schema。
- 新增 2026-06-11 release gate audit，把 PostgreSQL/staging 从旧的 Docker unavailable 状态刷新为 PASS。
- Docker 修复后再次复跑 staging rehearsal，生成 `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`，确认当前 Docker Desktop/Linux Engine、依赖容器、EF migration、API health 仍为 PASS。
- 新增 release gate audit `_docs/_reports/release-gate-audit-20260611-after-docker-restored-staging-rerun.md`，引用 docker-restored staging 证据。

## 验证

- `docker info`：Server 29.5.2，OSType linux，Docker Desktop。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：434 passed。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：85 passed。
- `dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj --no-restore`：2 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore`：175 passed。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260611-current.md -ImagePullMode Missing -DockerPullTimeoutSeconds 180 -ReadyTimeoutSeconds 180`：PASS。
- `docker compose ps`：5 个服务 running/healthy。
- `GET http://localhost:5000/live`：HTTP 200 `Healthy`。
- `GET http://localhost:5000/ready`：HTTP 200 `Healthy`。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md -ImagePullMode Missing -DockerPullTimeoutSeconds 180 -ReadyTimeoutSeconds 180`：PASS。
- `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`：Docker Server 29.5.2 / OSType linux；EF migrations database already up to date；`/live` 和 `/ready` 均 HTTP 200。
- `scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260611-after-docker-restored-staging-rerun.md ... -StagingReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md`：按预期 FAIL；PostgreSQL/staging 为 PASS，剩余失败项只有 Attack Chain A/B/C、security signoff、gray observation。

## 发布闸门

- Hosted CI：PASS，当前 `V1` 证据为 `_docs/_reports/hosted-ci-20260611-v1-pass.md`。
- PostgreSQL/staging：PASS，当前复跑证据为 `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`；原当前证据 `_docs/_reports/staging-rehearsal-20260611-current.md` 仍保留。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度与 14 天无 P0/P1 观察仍未关闭。
