# 2026-05-27 Final Delivery Package

## 变更

- 新增最终验收总览 `_docs/_review/20260527-final-acceptance-overview.md`，汇总前端、后端、A/B、证据链和残余限制。
- 新增最终 5 分钟 Demo Runbook `_docs/_marketing/20260527-final-demo-runbook.md`，串联 Dashboard → Scheduling → Audit → Report 的可演示路径。
- 新增最终 Release Notes `_docs/_reports/20260527-final-release-notes.md`，面向交付和复查说明本轮 AI MES 的能力边界、验证结果和已知限制。
- 修复本地演示巡检问题：开发/离线模式下演示账号优先本地登录，后端不可用时仅对已知演示账号回退，避免 `/api/v1/auth/login` 代理 500 阻断演示。
- 修复离线演示页面噪声：离线模式启用轻量甘特图，避免甘特图递归更新警告；移除 Google Fonts 远程导入，避免视觉巡检记录外部字体请求失败。
- 新增巡检修复复核记录 `_docs/_review/20260527-ultragoal-inspection-fixes.md`。

## 验证引用

- 前端全量 e2e：`74/74` passed。
- 后端全量：Unit `308/308`，Integration `138/138`。
- 后端性能测试：`GetAllPlans_Performance` 使用 warmup + 3 次稳定态采样并通过。
- 视觉截图：Dashboard / Scheduling / Audit / Report 四页离线模式 console 错误/警告 `0`，`/api` 与 `/hubs` 请求 `0`。
- 本轮全页面巡检：`src/frontend/output/ultragoal-audit-preview-fixed/audit-report.json`，19 个页面，登录回落登录页 `0`，原始问题 API 命中 `0`，全部网络请求失败 `0`，全部控制台消息 `0`。

## 备注

- 本轮只新增交付文档，不修改功能代码。
- OMX G001 仍显示 `in_progress` 的原因是 Codex goal snapshot 工具不可用；该限制已写入最终验收总览、Release Notes 和 final quality gate review。
