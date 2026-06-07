# 2026-06-05 ScheduleBoard Fail-loud Issues

## Fixed

- 问题：`ScheduleBoard.vue` 初始排产计划加载失败后，演示排产 fallback 的 warning 不包含后端失败原因。
- 风险：调度员无法判断当前 fallback 是计划 API、设备 API、网络还是权限失败导致。
- 处理：`loadData()` catch 中保留演示排产 fallback，并将 `errorMessage(e)` 写入 warnings-bar。
- 验证：目标 unit `1 file / 12 tests passed`，全量前端 unit coverage `82 files / 480 tests passed`，lint 通过。

## Remaining

- `ScheduleBoard.vue` 行覆盖率当前为 `68.88%`；仍可继续审计异步证据读取、Agent 建议采纳和复杂事件合并边界。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，但 GitHub 账号下未发现 `zenweb/AIMes`；当前 `origin` 仍不指向 GitHub。
