# Review: ProductionBoard 人员替班开工证据失败真实浏览器证据

日期：2026-06-06

## 结论

- 新增用例覆盖真实浏览器中的跨页人员替班开工失败路径。
- 该片只补证据，不改生产逻辑，符合精品化现有关键路径约束。

## 已验证

- 人员管理页生成替班建议后，生产页可读取 `AUD-LABOR-REASSIGN-20260520-001` 与 `TRACE-LABOR-REASSIGN-WO-013-OP-10`。
- Chromium 中模拟 `aimes_otd_evidence_chain` 写入失败时，页面显示 fail-loud 告警。
- 对话框保留，未显示 `已开工：淬火`。
- localStorage 未出现 `TRACE-LABOR-REASSIGN-WO-013-OP-10-START`。
- `production-board.test.ts` 22/22 仍通过。

## 风险

- e2e 文件当前未纳入 ESLint 配置，静态检查证据仍缺。
- 后端持久化、PostgreSQL/staging、hosted CI 不在本片范围内，不能由本片关闭发布闸门。

## 建议

- 下一片继续按覆盖率增量和用户必经程度选片。
- 若继续 ProductionBoard，可优先补开工证据失败后的人工恢复/重试路径证据；若转组件，应选低覆盖且业务关键的组件。
