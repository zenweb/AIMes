# 2026-06-14 Changelog - Schedule 外协释放事件刷新

## 变更
- 按“低覆盖 + 用户必经 + 现有功能深度”转向 `ScheduleBoard`，继续补排产主面板精品级证据。
- 修复外协到货建议采纳后，排产释放已归档但事件队列仍显示“外协到货已确认”的状态回退。
- 在外协释放 trace 已存在且 backend-first 暂时读回旧包时，保留当前释放态，避免 UI 事件和 OTD 证据链不一致。

## 验证
- `npm run test:unit -- tests/unit/schedule-board.test.ts`：40 passed。
- `npm run test:unit:coverage`：105 files / 758 tests passed。
- 覆盖率：总 lines 83.97%，statements 80.40%，branches 65.24%，functions 77.25%。
- `ScheduleBoard.vue`：lines 78.37%，statements 77.28%，branches 45.55%，functions 57.36%。

## 说明
- 本片没有新增功能，只修现有外协释放闭环的状态刷新一致性。
- 15 天灰度观察按 owner 指令后置，不再作为当前继续精品化工作的阻塞项。
