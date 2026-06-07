# 2026-06-05 Audit Replay Signoff Fail-loud Issues

## Fixed

- 问题：`AuditDecisionReplayPanel.vue` 的 POC 复盘签署 malformed payload 会触发未处理 `.join()` 异常。
- 风险：发布审计证据回放被单条坏签署记录拖垮，用户看不到基础回放卡和失败原因。
- 处理：新增 POC 复盘签署 replay payload 校验；坏载荷通过 `replay-sync-alert` 显性提示，并保留基础回放卡。
- 验证：目标 unit `1 file / 12 tests passed`，全量前端 unit coverage `82 files / 483 tests passed`，lint 通过。

## Remaining

- 继续按覆盖率杠杆选择低覆盖且用户关键路径，优先审计发布证据链和用户必经路径。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，但当前 repo 仍缺 GitHub host remote；不重复空跑 `gh run list`。
