# Plan: Audit Replay 质量灰度决策失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 后端 `QualityKnowledgeGrayReleaseDecision` 读取失败且本地无有效灰度决策记录时，审计回放面板显示 `质量灰度决策加载失败`。
- 基础回放卡片仍可见。
- 测试必须命中真实 Chromium API 路径，不只依赖本地静态数据。
- 共享 quality knowledge backend-first 读取器不能破坏已有成功链路。

## 执行

- [x] 新增失败单测，确认当前实现会把后端失败静默转成 `[]`。
- [x] 新增失败 Chromium e2e，确认当前页面不显示 `.replay-sync-alert`。
- [x] 修改 `queryQualityKnowledgeEvidence()`，不再吞掉后端错误。
- [x] 抽出统一 backend-first 读取器，保留本地兜底并在无本地记录时 fail-loud。
- [x] 跑目标单测、目标 e2e、完整 quality knowledge 单测、完整 audit e2e。

## 验证

- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "fails loud when backend gray release decisions fail"`：passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量灰度决策接口失败"`：Chromium passed。
- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts`：21/21 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`：Chromium 17/17 passed。
