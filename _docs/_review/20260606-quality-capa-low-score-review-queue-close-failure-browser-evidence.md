# Review: QualityCapaTaskPanel 低分复核队列关闭失败浏览器证据

未发现本轮新增 e2e 的阻断问题。该片只补真实浏览器证据，不改变生产逻辑。

## 核查

- 失败注入发生在预置 open 队列之后，能够专门覆盖“关闭回写失败”，不是队列生成失败的重复。
- 质量知识 evidence 查询被 route 成空数组，避免后端数据污染本地预置状态。
- 用例同时检查 UI fail-loud、可重试按钮、关闭结论不出现、关闭结论 trace 不可见、再训练候选 trace 不可见、本地队列仍为 open、OTD 证据未伪造。
- 测试使用 Nuxt production build + Chromium，符合真实浏览器证据要求。

## 剩余风险

- 本轮未全量重跑 `quality.spec.ts`。
- B 轨发布闸门仍未关闭，不能把本片视作发布完成或安全签字证据。
