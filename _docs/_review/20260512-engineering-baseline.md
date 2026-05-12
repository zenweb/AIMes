# Review — 2026-05-12 设计文档重写 + 工程基线补齐

## 概述

今日完成了审计报告中 Path B 的剩余工作：设计文档重写为 V1 基线、工程基线（OpenTelemetry 增强 + E2E 测试修复 + CI 配置）。

## 变更清单

### 设计文档重写（3 文件）
- `aimes-design-doc.v1.md`：更新安全模型（Refresh Token + 速率限制已实现）、V1 已落地能力表（追加采纳反馈 + 多目标优化 + 认证安全）
- `aimes-design-doc.md`：存档为决策草稿，重定向到 v1.md

### 工程基线（8 文件）
- `src/MES.Api/Program.cs`：OpenTelemetry 增强 — 添加 ASP.NET Core 请求指标、HTTP 客户端指标、Runtime 指标（GC/CPU/内存）
- `src/MES.Api/MES.Api.csproj`：添加 `OpenTelemetry.Instrumentation.Runtime` 依赖
- `frontend/tests/e2e/dashboard.spec.ts`：修复路由路径 `/scheduling/dashboard` + 认证 token 设置
- `frontend/tests/e2e/chat.spec.ts`：修复认证 token 设置
- `frontend/tests/e2e/modules.spec.ts`：修复路由路径 + login 选择器（`#username` 而非 `[name="username"]`）
- `frontend/index.html`：修复页面标题为 "AIMes — 智能排产管理系统"
- `.github/workflows/eval.yml`：移除不合适的 benchmark 步骤

### 其他
- `.gitignore`：排除 Playwright test-results 目录

## 测试结果

| 套件 | 结果 |
|------|------|
| Scheduling 排产甘特图 | 9/9 ✅ |
| Dashboard 生产概览 | 6/6 ✅ |
| AI 生产助手 (ChatPanel) | 7/7 ✅ |
| 功能模块 E2E | 10/10 ✅ |
| **总计** | **32/32 ✅** |

## 未完成/待定

- CI 性能基准：BenchmarkDotNet 适合本地 Release 模式运行，不适合 Debug 模式 CI；建议后续建立单独的 benchmark CI workflow
- 密钥轮转策略、审计日志归档周期：低优先级，标记为"待补齐"
