# 2026-05-20 P1 — 设备故障与瓶颈联动

## 触发

深化计划中 P1 “设备故障与瓶颈联动”要求设备状态变化能转换成排产影响，故障诊断要输出预计停机、影响工单、可替代设备和是否需要重排，瓶颈设备需要有保护策略。

## 产出

- 新增 `src/frontend/src/components/equipment/EquipmentScheduleImpactPanel.vue`
- 新增 `src/frontend/src/utils/equipment-risk-sync.ts`
- 更新 `src/frontend/src/components/equipment/EquipmentBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/equipment.spec.ts`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 补充维护窗口文案为“推荐预防维护窗口”，让设备页展示与瓶颈保护策略保持一致。

## 功能

- `设备维护` 页面新增“设备故障与瓶颈联动”面板。
- 展示 `CNC-001` 不可用影响：
  - 预计停机 4h
  - 影响工单
  - 可替代设备
  - 推荐维护窗口
  - 瓶颈保护策略
- 支持“标记故障并同步排产”。
- `AI 排产` 事件队列读取设备停机事件，新增设备故障事件。
- Agent 设备故障建议覆盖换设备、延后、加班、拆单。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
  - 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900 kB。
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/equipment.spec.ts --reporter=list --workers=1 --retries=0`
  - 结果：18 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`
  - 结果：103 passed。

## 下一步

继续 P1：生产执行闭环补强，把异常上报进一步落到异常管理事件，并让工序 SOP、质检点、设备要求和物料齐套进入开工校验。
