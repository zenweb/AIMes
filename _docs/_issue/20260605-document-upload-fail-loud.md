# 2026-06-05 DocumentUpload Fail-loud Issues

## Fixed

- 问题：`DocumentUpload.vue` 的客户工单导入证据后端刷新失败时静默吞错。
- 风险：POC 数据缺口面板保留本地或空状态，用户无法知道后端证据刷新失败。
- 处理：将静默 catch 改为显性 `error.value`，通过 assertive alert 带出失败原因，并说明已保留本地导入样例状态。
- 验证：目标 unit `1 file / 13 tests passed`，全量前端 unit coverage `82 files / 481 tests passed`，lint 通过。

## Remaining

- 继续按覆盖率杠杆选择低覆盖且用户关键路径，不继续精修已收口组件。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，但当前 repo 仍缺 GitHub host remote；不重复空跑 `gh run list`。
