# Admin 治理证据加载隔离下一步

- [x] 定位 Admin 初始化证据加载短路原因。
- [x] 增加逐项证据加载隔离和 fail-loud 提示。
- [x] 定向复跑此前失败的 R3/R5 Chromium 用例。
- [x] 合并复跑当前切片 3 条 Chromium 证据。
- [x] 定向 lint `AdminBoard.vue`。
- [x] 复跑整份 `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts`，Chromium 15/15 passed。
- [ ] 继续按“低覆盖且用户必经”规则选择下一片，不回头精修已通过的登录页/单个失败态微切片。
- [ ] 单独推进 B 轨发布闸门证据，不用 A 轨浏览器绿灯替代发布签字。
