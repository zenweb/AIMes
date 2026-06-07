# Staging Rehearsal Registry Diagnostics

日期：2026-06-06

## 范围

- B 轨道 PostgreSQL/staging rehearsal。
- 目标：把 Docker image pull 失败从“超时”细化为可复跑、可诊断的 registry/proxy 证据。
- 本报告不关闭 staging gate。

## 脚本改进

- `scripts/run-staging-rehearsal.ps1`
  - 新增 `-DockerPullTimeoutSeconds` 参数，默认仍为 `90` 秒。
  - 报告头写入 `DockerPullTimeoutSeconds`。
  - 新增 `Docker registry/proxy diagnostics` 步骤，记录：
    - registry mirrors。
    - Docker HTTP proxy。
    - Docker HTTPS proxy。
    - local images。
  - 拉取超时时提示检查 Docker Desktop HTTPS proxy、registry mirror 或预拉取镜像。

## 验证

- PowerShell parser：
  - Result: PASS。
  - Output: `parse ok`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "StagingRehearsal|ReleaseGateAudit" --no-restore`
  - Result: PASS。
  - 12/12 passed。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260606-registry-diagnostics.md -DockerPullTimeoutSeconds 25`
  - Result: FAIL。
  - Docker version step: PASS。
  - Registry mirrors: `[]`。
  - HTTP proxy: `http.docker.internal:3128`。
  - HTTPS proxy: `http.docker.internal:3128`。
  - Local images: empty。
  - Failure: `docker pull postgres:16-alpine timed out after 25 seconds`。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260606-registry-diagnostics.md ...`
  - Result: FAIL。
  - PostgreSQL/staging still FAIL。

## 结论

- Docker engine 可用。
- 当前 staging 阻断点是 Docker Hub image pull 不可达或代理/镜像源配置不可用。
- EF migration、API start、`/live`、`/ready` 仍未执行到，因此 PostgreSQL/staging gate 不能关闭。
