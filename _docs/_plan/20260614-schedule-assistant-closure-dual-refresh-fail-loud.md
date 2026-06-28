# 2026-06-14 Plan - 排产 Assistant 闭环双刷新 Fail-Loud

## 成功标准
- 恢复交接闭环后，恢复包刷新失败和工程约束包刷新失败都能被用户看到。
- 启动阶段工程约束失败文案不被闭环文案污染。
- 默认工程约束包读取仍保持兼容兜底。
- 单测、真实浏览器 e2e、coverage 全部通过。

## 执行
- 先补组件测试，复现双失败反馈丢失。
- 再补 API/sync 测试，复现工程约束包后端错误被吞掉。
- 增加工程约束包 fail-loud 选项。
- 在闭环刷新路径追加用户反馈，不覆盖已有失败。
- 扩展真实浏览器用例同时验证恢复包和工程约束包 503。

## 验证
- `npm run test:unit -- tests/unit/assistant-evidence-api.test.ts`
- `npm run test:unit -- tests/unit/assistant-engineering-constraint-package-sync.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 决策
- 不等待 15 天灰度观察；该步骤已按 owner 指令跳过/延期。
- 不新增功能，只补强现有排产闭环的失败可观察性。
