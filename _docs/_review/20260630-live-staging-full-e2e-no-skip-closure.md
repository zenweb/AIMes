# Review: Live Staging Full E2E No-Skip Closure

日期：2026-06-30

## 结论

未发现需要继续修复的前端 E2E 阻断项。

## 风险检查

- Employee live backend 只转发本用例所需的 `auth/login` 与 `employee` API，不再污染其他离线演示用例。
- `AIMES_LIVE_API_BASE_URL` 默认仍为 `http://localhost:5003`，本次运行显式覆盖为 `http://127.0.0.1:5002`。
- `scripts/run-employee-live-backend-evidence.ps1` 已同步改为 `AIMES_LIVE_API_BASE_URL` 模式，避免脚本层继续设置全局 `VITE_API_TARGET`。
- Scheduling live staging 仍直接校验 API read model 与 PostgreSQL readback，同步覆盖保存成功和 locked plan 拒绝路径。
- 完整 E2E 已从 `387 passed / 3 skipped` 提升到 `390 passed / 0 skipped`。
- Frontend lint 与全量 unit 已重新验证通过：`118 files / 1255 tests passed`。
- Hosted CI 首轮在 backend `dotnet format --verify-no-changes` 暴露两个历史格式红点：migration BOM 与 integration test using 顺序；已按 formatter 最小修复并本地复跑通过。
- Hosted CI 第二轮在 `Sprint0CurrentBaselineIndex_ShouldCiteEmployeeLiveBackendRecoveryEvidence` 暴露旧 `20260622/5003` evidence token；已同步为当前 `20260630/5002` evidence，并保留历史 phase-one matrix 不混改。
- Hosted CI 第三轮已全绿：CI run `28448378818`，Agent Evaluation run `28448378837`，同一 head `a2e60121029e093db102dc9ca63d09f8cb2485f3`。
- Release gate audit 已用当前 hosted CI 证据重跑：`_docs/_reports/release-gate-audit-20260630-current-hosted-ci-a2e6012-deferred-gray.md`，结果仍为 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`。
- CI annotation 仍提示 invalid submodule cleanup：`tmp/agent-e2e-slice-20260622` 与 `tmp/combo-labor-agent-20260622` 是无 `.gitmodules` URL 的 gitlink；已从索引移除并 ignore `/tmp/`，避免后续 hosted runner cleanup 噪音。
- Release gate audit 仍是 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`，没有把 deferred gray 误报成 strict release PASS。
- Repo-local CC plan bridge 已更新到 2026-06-30 证据路径，避免继续引用旧 employee 5003 证据作为当前入口。

## 已处理的失败模式

- 一次完整套件试跑把 `VITE_API_TARGET` 全局指向 live API，导致离线质量用例被真实后端 401 污染并在 login/dashboard 间跳转。
- 修复后通过测试内部 route 转发 live backend 端点，质量首用例与完整套件均恢复通过。
- 本轮收口前 unit 初跑暴露 5 个测试期望落后：报表错误来源提示文案已更新，扫码测试补齐 `isOfflineDemoMode` mock；复跑目标文件与全量 unit 均通过。
- Architecture focused guard 复跑通过：`Sprint0CurrentBaselineIndex_ShouldCiteEmployeeLiveBackendRecoveryEvidence`。

## 剩余风险

- 这不是发布灰度观察结果；14 天无 P0/P1 仍需独立跟踪。
- Docker Desktop 必须处于运行状态，否则 live staging 证据无法复现。
- Git over HTTPS 到 `github.com:443` 在本机仍不稳定；本次远端 ref 与 CI 证据通过 `api.github.com` / `gh run` 校验。后续常规 `git push` 需要网络恢复。
