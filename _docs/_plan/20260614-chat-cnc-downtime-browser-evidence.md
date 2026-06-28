# 2026-06-14 Plan - ChatPanel CNC 停机问答真实浏览器证据

## Success Criteria
- 当前 release gate 报告明确灰度观察为 owner 后置，而不是静默阻塞。
- `ChatPanel` CNC-001 4 小时停机问答在真实 Chrome 中通过。
- 证据截图能展示业务回答和动作入口。
- 后端来源分数越界时，UI 证据置信度必须夹紧到 0%-100%。
- 不修改业务代码，不扩新功能。

## Execution
- 读取覆盖率报告，确认 `ChatPanel.vue` 是低覆盖且用户必经的候选。
- 运行单条 E2E 验证问答链路。
- 用生产构建启动本地 preview，真实 Chrome 复现同一链路并截图。
- 补充来源分数越界单元测试。
- 补齐当天 5 类文档。

## Stop Condition
- E2E 通过且截图证据落盘后停止。
- 如后续该路径失败，先复现并定位，不继续盲试。
