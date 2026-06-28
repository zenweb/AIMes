# 2026-06-14 Plan - 排产外协释放缺失承诺包 Fail-Loud

## 成功标准
- 外协到货建议采纳后，如果排产释放无法找到已到货承诺包，用户必须看到可访问状态反馈。
- 反馈必须说明释放审计未归档，并包含 `sourceKpiId`。
- 该失败不得误生成“外协排产释放已确认”建议。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `schedule-board.test.ts` 增加 `confirmOutsourcingScheduleRelease` 返回空值的 RED 用例。
- 在 `ScheduleBoard.vue` 的空返回分支追加 fail-loud 反馈。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟页面已有外协到货事件但采纳前本地包缺失。
- 跑完整相关验证并记录结果。

## 验证命令
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
