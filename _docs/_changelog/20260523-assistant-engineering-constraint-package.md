# 2026-05-23 - AI 助手工程约束复核包

## 背景

此前 `AI 生产助手` 对工程数据约束只能回答和跳转，不能把 `BOM / ECN / 工艺路线 / 质量门` 变成一张可执行的复核动作包，导致“工程数据进入排产解释”仍停留在读屏层。

## 本次变更

- 新增 `assistant-engineering-constraint-package-sync.ts`
  - 写入 `aimes_assistant_engineering_constraint_packages`
  - 自动补齐 `工程变更影响分析` 与 `工艺能力放行` 前置记录
  - 同步写入 OTD `助手工程约束` 证据链
- `AI 生产助手` 新增可执行动作 `生成工程约束复核包`
  - 审计号：`AUD-CHAT-ENG-CONSTRAINT-20260523-001`
  - 追踪号：`TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523`
  - 责任模块：`BOM 管理 / 工艺路线 / AI 排产 / 质量门/工程审批`
- `AI 排产` 事件队列新增 `助手工程约束` 事件
- `审计日志` 新增该动作的专属回放文案
- `系统管理` 助手动作类型标签补充 `工程约束包`

## 用户可见结果

- 在聊天中输入“帮我生成工程约束复核包”后，可直接生成 `BOM-A100 / R-B200 工程约束复核包`
- 聊天卡片、排产事件、OTD 证据链、审计回放共用同一条 trace
- 工程数据从“解释来源”推进为“可执行责任动作”

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`
- `npm run test:e2e -- tests/e2e/chat.spec.ts --grep "生成工程约束复核包"`
- `git diff --check`
