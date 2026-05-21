# 2026-05-21 P3 — 条码返工释放回写 AI 排产

## 触发

上一轮已在 `质量闭环`、`条码 / QR 打印`、`报表中心` 和 `审计日志` 中完成扫码返工复验放行，但 `排产回写` 还只是证据链记录。真实现场里，质量复验释放后调度员需要在 `AI 排产` 里看到后段窗口已经恢复，并复核是否重新安排 `OP-20`。

## 产出

- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scanner.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 更新 `_docs/_changelog/20260521-p3-barcode-rework-release.md`

## 功能

- `AI 排产` 事件队列读取统一 OTD 证据链中的：
  - `TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE`
  - 阶段：`排产回写`
  - 标题：`WO-RUSH-9001 OP-20 接收窗口已恢复`
- 读取到该证据后生成已缓解质量事件：
  - 类型：`扫码返工释放`
  - 标题：`WO-RUSH-9001 OP-20 排产窗口恢复`
  - 窗口：`复验放行后`
  - 状态：`已缓解`
- 事件证据串联冻结释放后的 3 个关键追踪编号：
  - `TRACE-QR-WO-RUSH-9001-OP-10-RECHECK`
  - `TRACE-QR-WO-RUSH-9001-OP-10-RELEASE-OP-20`
  - `TRACE-QR-WO-RUSH-9001-OP-10-SCHEDULE-RELEASE`
- 点击 `复核排产影响` 后生成 Agent 建议：
  - 标题：`质量复验放行后的排产复核`
  - 建议：把 `WO-RUSH-9001` 的 `OP-20 装配复检` 窗口恢复到锁定期后第一个可用班次。
  - 影响：`OTD +3%`、延期 `-1 单风险`、换线 `0min`。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`。
- 通过：`npm run test:e2e -- tests/e2e/scanner.spec.ts --grep "质检不合格"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/scheduling.spec.ts`，19 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

本轮下一片已推进“质量隔离 / 返工工时成本”证据，后续继续把这批扫码质量事件沉淀为 CAPA 推荐样本和质量知识库复用链路。
