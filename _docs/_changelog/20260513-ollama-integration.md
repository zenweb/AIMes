# 2026-05-13 Changelog — Ollama 本地 LLM 集成

## 变更清单

### 后端（3 文件）
- `src/MES.AI/Services/ILlmGateway.cs` — 新增 `GetStatusAsync` 方法 + `LlmStatusDto`
- `src/MES.AI/Services/LlmGatewayService.cs` — 实现 `GetStatusAsync`：Ollama 通过 `/api/tags` 端点检测连通性（支持 `localhost` + `host.docker.internal`），云提供者报告已配置
- `src/MES.Api/Controllers/LlmController.cs` — 新建控制器：`GET /api/v1/llm/status`（免认证）+ `GET /api/v1/llm/config`（需认证）

### 前端（3 文件）
- `frontend/src/api/llm.ts` — 新建 API 模块：`LlmStatus`/`LlmConfig` 类型 + `getLlmStatus`/`getLlmConfig` 函数
- `frontend/src/components/chat/ChatPanel.vue` — 头部新增模型徽标（Ollama 或云提供者名称），`onMounted` 时自动获取
- `frontend/src/components/admin/AdminBoard.vue` — 新增 "LLM 设置" Tab：连通性指示器（绿/红点）、当前配置详情、提供者卡片展示 + 切换指南

## 验证
- 后端 `dotnet build` — 0 errors
- 前端 `vite build` — 构建成功
- E2E: Chat 7/7 ✅（模型徽标不影响现有测试）
