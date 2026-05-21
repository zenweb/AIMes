# 2026-05-20 POC 客户真实工单导入样例闭环

## 变更

- `报表中心` 的 POC 补齐缺口新增“准备导入样例”入口，跳转到 `文档上传`。
- `文档上传` 新增“客户真实工单导入样例”面板，可生成 `IMP-POC-WO-20260520-001` 演示导入批次。
- 导入批次映射工单号、产品、交期、工艺路线、物料缺口和设备约束，并进入知识治理队列。
- `报表中心` 读取导入证据后，把执行回写维度从 `18/20` 提升到 `20/20`，当前 POC 评分从 `97/100` 提升到 `99/100`，并把“客户真实工单导入样例”验收证据改为已准备。

## 验证

- `npm run test:e2e -- tests/e2e/report.spec.ts tests/e2e/knowledge.spec.ts -g "客户真实工单导入样例"`：2 passed。
- `npm run test:e2e -- tests/e2e/report.spec.ts tests/e2e/knowledge.spec.ts`：8 passed。
