# 2026-05-23 - AI 助手 BOM 展开齐套检查包

## 背景

`BOM-A100 / WO-RUSH-9001` 的齐套检查包此前只能从 BOM 管理页面生成。AI 生产助手可以解释已生成记录，但不能直接把“帮我生成 BOM 齐套包”转成库存、排产和审计可追踪动作。

## 本次变更

- `AI 生产助手` 新增 `生成 BOM 展开齐套检查包` 动作。
- 动作复用 `aimes_bom_kitting_package` 和 `aimes_shortage_kitting_event`：
  - 审计号：`AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522`
  - 追踪号：`TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001`
  - 关键缺口：`M-AL-6061` 缺口 `19 件`
  - 替代候选：`M-AL-6061B` 可用但需工程确认
- 同步写入 OTD `库存齐套` 证据链。
- `AI 排产` 继续通过现有缺料事件读取同一齐套包。
- `审计日志` 增加助手 BOM 齐套动作专属回放文案。
- `系统管理` 助手动作标签补充 `BOM齐套包`。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`
- `npm run test:e2e -- tests/e2e/chat.spec.ts --grep "生成 BOM 展开齐套检查包"`
- `git diff --check`
