# 2026-06-05 Review - Frontend API HTML Fallback E2E

## 结论
- 原红灯不是单纯等待问题，也不是审计回放 selector 问题。
- 根因是 E2E 前置脚本在新 document 中把 `aimes_offline_demo` 重置为 `false`，无后端 preview 环境返回 SPA HTML 200，前端缺少 API HTML fallback 边界识别。

## 风险检查
- 共享 HTTP 边界会让 HTML fallback 以异常形式暴露给调用方；已有页面 catch/fallback 能接管。
- 排产页新增载荷守卫后，坏计划不会写入 `planData`，降低渲染层 `.length` 崩溃风险。
- 未扩大产品功能，只硬化现有 Dashboard -> Scheduling -> Audit -> Report 主链路。

## 剩余风险
- SignalR negotiation 在 preview 无后端时仍会产生控制台错误；本次未扩大处理，因它不阻塞主链路渲染。
