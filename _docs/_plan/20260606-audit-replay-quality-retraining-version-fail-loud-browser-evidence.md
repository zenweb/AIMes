# Plan: Audit Replay 质量再训练版本失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 后端 `QualityKnowledgeRetrainingVersion` 读取失败且本地无有效再训练版本记录时，审计回放面板显示 `质量再训练版本加载失败`。
- 基础回放卡片仍可见。
- 测试必须命中真实 Chromium API 路径，不只依赖本地静态数据。
- 新证据不能破坏质量推荐成功链路、质量灰度发布链路和已有失败态。

## 执行

- [x] 新增单测，确认后端质量再训练版本失败且无本地记录时抛错。
- [x] 新增 Chromium e2e，确认面板显示 `质量再训练版本加载失败`。
- [x] 跑目标单测、目标 e2e、完整 quality knowledge 单测、完整 audit e2e。

## 验证

- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "backend retraining versions fail"`：passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量再训练版本接口失败"`：Chromium passed。
- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts`：23/23 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`：Chromium 19/19 passed。
