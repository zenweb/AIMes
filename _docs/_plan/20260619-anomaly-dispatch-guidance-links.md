# 20260619 Anomaly Dispatch Guidance Links Plan

## 成功标准
- 异常分流确认前有简体中文和英文提示。
- UI 提供相关模块链接和帮助入口。
- 分流事件队列可通过无障碍属性关联到提示内容。
- 变更通过单测、全量覆盖率、lint、build 和真实浏览器验证。

## 执行步骤
1. 写目标失败测试，锁定 `.dispatch-guidance`、双语文本、链接和 `aria-describedby`。
2. 在 `AnomalyBoard.vue` 添加最小 UI 和样式。
3. 跑目标测试、组件测试、全量前端验证。
4. 启动生产预览并在真实浏览器检查 DOM 和截图。
5. 更新本片文档。

## 验证结果
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "guides anomaly dispatch"`：通过。
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`：21 个测试通过。
- `npm run test:unit:coverage`：111 个文件、1101 个测试通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- 真实浏览器截图：`anomaly-dispatch-guidance-real-browser-20260619`。
