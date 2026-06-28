# 2026-06-14 Plan - 排产 Assistant 恢复闭环本地保存 Fail-Loud

## 成功标准
- 当 Assistant 恢复交接闭环无法在本地保存时，用户必须看到可访问的状态反馈。
- 反馈必须包含失败原因语义和执行包 ID。
- 该失败不得误生成“闭环复核建议”。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `schedule-board.test.ts` 增加本地闭环保存失败单测，先观察 RED。
- 在 `ScheduleBoard.vue` 的 `closeAssistantRecoveryHandoff` 空返回分支追加 fail-loud 反馈。
- 在 `scheduling.spec.ts` 增加 Chromium 真实浏览器用例，模拟远端恢复包存在但本地包缺失。
- 跑完整相关验证并记录结果。

## 验证命令
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
