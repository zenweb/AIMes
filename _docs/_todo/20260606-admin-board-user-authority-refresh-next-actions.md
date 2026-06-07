# 2026-06-06 AdminBoard 用户后端权威刷新下一步

## Done

- 已完成：用户创建成功后刷新后端权威用户列表。
- 已完成：用户编辑成功后刷新后端权威用户列表。
- 已完成：用户启停成功后刷新后端权威用户列表。
- 已完成：写入成功但刷新失败时 fail loud，不把本地状态伪装成后端确认状态。
- 已完成：跑通 AdminBoard 定向单测、全量前端 coverage 和真实 Chromium `admin.spec.ts`。
- 已完成：用生产构建产物和系统 Chrome 截图确认 Admin 页面真实渲染。

## Next

- 继续按覆盖率杠杆选择用户必经、低覆盖、业务关键组件。
- `AdminBoard.vue` 分支覆盖仍低，后续可审计 Agent 配置审批、审计跳转、灰度治理分支；但下一片应先和其他用户关键低覆盖组件比较边际收益。
- 不用前端覆盖率提升替代发布 B 轨门禁。

## B-track

- 仍需真实 GitHub Actions run、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
