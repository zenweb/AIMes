# 2026-05-23 - AI 助手客户交付恢复承诺包

## 背景

此前客户交付恢复承诺包只能从报表中心 KPI 钻取生成，`AI 生产助手` 只能解释已存在的承诺包或提示用户去报表页生成，助手还没有把客户承诺口径转成可执行动作。

## 本次变更

- `AI 生产助手` 新增 `生成客户交付恢复承诺包` 动作。
- 动作复用 `writeOtdKpiCommitmentPackage()`，默认生成 `华东新能源` 客户维度承诺：
  - 基线 OTD：`76%`
  - Agent OTD：`94%`
  - 提升：`+18%`
  - 延期减少：`3 单`
  - 审计号：`AUD-KPI-COMMITMENT-HUADONG-20260521-001`
  - 追踪号：`TRACE-KPI-COMMITMENT-HUADONG-20260521`
- 聊天动作卡片展示客户交付、AI 排产、采购/工程/质量三类责任动作。
- `AI 排产` 事件队列读取最新客户承诺包，生成 `客户承诺包` 事件和排产复核建议。
- `审计日志` 为助手客户承诺动作增加专属回放文案。
- `系统管理` 助手动作标签补充 `客户承诺包`。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`
- `npm run test:e2e -- tests/e2e/chat.spec.ts --grep "生成客户交付恢复承诺包"`
- `git diff --check`
