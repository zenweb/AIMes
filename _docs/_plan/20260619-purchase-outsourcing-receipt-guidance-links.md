# 20260619 Purchase Outsourcing Receipt Guidance Links Plan

## 成功标准
- 外协到货确认前有简体中文和英文提示。
- UI 提供风险、排产、报表和帮助入口。
- 外协到货确认面板可通过无障碍属性关联到提示内容。
- 变更通过目标测试、组件测试、全量覆盖率、lint、build 和真实浏览器验证。

## 执行步骤
1. 写目标失败测试，锁定 `.outsourcing-receipt-guidance`、双语文本、链接和 `aria-describedby`。
2. 在 `PurchaseBoard.vue` 添加最小 UI 和响应式样式。
3. 跑目标测试、采购组件测试和全量前端验证。
4. 启动生产预览，在真实浏览器注入演示外协承诺包并检查 DOM/截图。
5. 更新本片文档。

## 验证结果
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "guides outsourcing receipt"`：通过。
- `npm run test:unit -- tests/unit/purchase-board.test.ts`：36 个测试通过。
- `npm run test:unit:coverage`：111 个文件、1102 个测试通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- 真实浏览器截图：`purchase-outsourcing-receipt-guidance-visible-real-browser-20260619`。
