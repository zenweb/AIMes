# Plan: ProductionBoard 人员替班开工证据失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 真实 Chromium 从人员管理页生成替班建议。
- 生产页 `WO-013` / `OP-10` 开工校验读取替班证据。
- `aimes_otd_evidence_chain` 写入失败时显示 fail-loud 告警。
- 不显示成功开工 trace。
- 不写入 `TRACE-LABOR-REASSIGN-WO-013-OP-10-START`。
- 生产看板单元回归通过。

## 执行

- 已新增 `tests/e2e/production.spec.ts` 用例：`人员替班开工证据写入失败时真实浏览器保留 fail-loud 告警`。
- 已运行真实浏览器验证。
- 已运行 ProductionBoard 单元回归。

## 验证命令

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "人员替班开工证据写入失败"`
- `npm.cmd run test:unit -- tests/unit/production-board.test.ts`

## 停止条件

- 本片 A 轨证据已补齐。
- B 轨外部发布闸门未关闭，不能声明 v1.0.0 发布就绪。
