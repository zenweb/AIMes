# 2026-06-05 Staging Rehearsal Next Actions

## Done

- 已启动 Docker Desktop engine。
- 已复跑 staging rehearsal，并生成 `_docs/_reports/staging-rehearsal-20260605-local.md`。
- 已加固 `run-staging-rehearsal.ps1`，显式拉取依赖镜像并在网络/代理失败时 fail loud。
- 已复跑 release gate audit，确认 v1.0.0 B-track 仍为 `Result: FAIL`。

## Next

- 配置 Docker Desktop HTTPS proxy/镜像源，或预拉取 staging 所需四个镜像。
- 复跑 staging rehearsal，目标是依次拿到：
  - `Pull external dependency images` exit code 0
  - `Start external dependencies` exit code 0
  - `Apply EF migrations` exit code 0
  - `Start API` exit code 0
  - `/live` HTTP 2xx
  - `/ready` HTTP 2xx
- staging PASS 后复跑 release gate audit；Hosted CI、Attack Chain A/B/C、安全签字、灰度观察仍需独立关闭。
