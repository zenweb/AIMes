# 2026-06-12 Changelog：排产拖拽结束时间回写闭环

## 变更

- 修复排产页拖拽保存成功后只更新 `start_date` 和 `duration`，未同步 `end_date` 的问题。
- 加强 `ScheduleBoard` 单测：拖拽保存成功后，断言传给甘特图的数据同时包含新的开始时间和结束时间。
- 加强真实 dhtmlx E2E：拖拽保存成功/失败两条路径都校验提交给 reschedule API 的时间窗口有效，且约为 4 小时。

## 验证

- `npm run test:unit -- schedule-board.test.ts -t "marks rush-order adoption as formally saved after a successful drag reschedule"`：通过。
- `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 拖拽保存" --reporter=line --retries=0`：2 passed。

## 说明

- 本片继续围绕排产页现有核心路径精品化，不扩新功能。
- 大目标仍未完成，发布闭环与其它核心路径仍需继续推进。
