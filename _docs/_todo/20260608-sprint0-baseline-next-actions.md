# 2026-06-08 Sprint 0 Baseline Next Actions

## 优先处理

1. 修复前端 e2e 当前 13 个红项。
2. 修复 `npm run test:unit` 默认并行 worker timeout，让默认命令本身可作为稳定基线。
3. 把 Integration / Unit 的依赖图刷新动作内化到标准 restore/build 流程，避免旧 assets 伪造红灯。

## 建议切口

- 第一刀：`admin.spec.ts` / `audit.spec.ts` 共享的 Agent 治理与审计回放链路。
- 第二刀：`chat.spec.ts` 的证据卡片/回放卡片缺失链路。
- 第三刀：`report.spec.ts` 的 POC 上线监控证据链。
- 并行稳定性：评估是否在 `vitest.config.ts` 固化较低 worker 并发，或仅对重型 suite 做分片。

## 暂不做

- 不把串行 vitest 绿灯误写成默认 `npm run test:unit` 已稳定。
- 不把当前 e2e 红项视作发布门禁以外的“可忽略噪音”。
