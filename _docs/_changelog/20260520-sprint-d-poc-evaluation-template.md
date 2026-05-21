# 2026-05-20 Sprint D — POC 评估模板与售前 Checklist

## 触发

Sprint D 已完成 OTD 改善复盘报告，本次继续输出 POC 评估模板，并把 5 分钟演示路径沉淀成售前 checklist。

## 产出

- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/src/types/report.ts`
- 更新 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 报表中心新增“AI MES 交期改善 POC 评估模板”。
- 模板面向离散制造工厂 2 周 POC，默认通过线 85 分。
- 评分维度：
  - OTD 改善，30 分
  - 事件闭环，25 分
  - 执行回写，20 分
  - 可解释与审计，15 分
  - 演示完整度，10 分
- 验收证据 checklist：
  - 30 单演示数据集与 OTD 基线
  - 急单/缺料/设备三类事件截图
  - 采购加急单与收货回写记录
  - 客户真实工单导入样例
  - POC 复盘会评分表
- 售前 Demo Checklist：
  - 打开生产概览
  - 进入风险预警
  - 进入 AI 排产
  - 处理采购缺料
  - 打开报表中心
- CSV 导出追加 POC 评分维度、验收证据和售前 Demo Checklist。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/report.spec.ts --reporter=list --workers=1 --retries=0`：3 passed。
- `node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`：79 passed，1 skipped。

## 下一步

继续 P2/P3 深化：优先补“AI 生产助手可执行动作”或“工程数据变排产约束来源”。
