# 20260516 — P1-6 前端 axios 统一 + refresh token 流程

## 背景

`/review all of solution` Codex 第一轮发现：前端有两套并行 axios 拦截器（`main.ts` 全局 + `api/http.ts` instance）且不重叠，401 时都 hard reload 到登录页——**完全不用 refresh token，但后端 `/auth/refresh` 端点已实现且 7 天有效**。

工厂操作员每 8 小时被踢出登录页 = 工时浪费 + funnel 流失。

## 修复

### 1. 后端 API client 类型扩展

`src/frontend/src/api/auth.ts`：
- `LoginResponse` 加 `refreshToken: string` 字段（后端早已下发，前端没接收）
- 新增 `RefreshTokenResponse` 接口
- 新增 `refresh(refreshToken)` 函数（虽然 http.ts 内部直接调，但导出便于将来其他模块用）

### 2. Auth store 持久化 refresh token

`src/frontend/src/stores/auth.ts`：
- 新 key `aimes_refresh_token` 存到 localStorage
- `saveUser(user, refreshToken)` 接收第二个参数
- `clearUser()` 清掉三个 key

### 3. http.ts 加 401 → /auth/refresh → retry 流程

`src/frontend/src/api/http.ts`：
- 共享 `refreshing: Promise<string> | null` 防并发 401 触发多次 /auth/refresh
- 401 + 未重试过 + 不是 /auth/refresh 自身 → 调 refresh → 重试原请求
- refresh 失败（refresh token 过期/缺失）→ 清空 + 跳登录
- /auth/refresh 自身 401 → 直接清空跳转，避免无限循环
- 其他错误：保留 ProblemDetails 消息提取 + toast（从 main.ts 搬过来）
- refresh 用裸 axios 调，避免拦截器递归

### 4. main.ts 收敛

`src/frontend/src/main.ts`：
- 删除 `axios.interceptors.*` 双套注册（与 http.ts 不重叠的那套）
- 保留 Vue 错误处理 + unhandledrejection 监听
- 注释明确「所有业务通过 import http from '@/api/http' 调用」

### 5. QualityBoard.vue 收敛裸 axios

发现 `components/quality/QualityBoard.vue:324` 还在用 `axios.get('/api/v1/anomalies')`（绕过 http.ts 拦截器）。改用 `import http from '../../api/http'` + `http.get('/anomalies')`。
现在前端**只剩 http.ts 一处 import axios**，完全收敛。

## 验证

```
src/frontend && npm run build
→ vue-tsc 严格模式通过
→ Vite 生产构建成功（gantt 718KB / vendor 551KB / brotli 41+146KB）

dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj
→ 239 / 0 失败
```

## 验收行为（实际起 docker compose 后才能验证）

- 用户登录后 access token 8 小时有效，refresh token 7 天有效
- access token 过期时下一次 API 调用：401 → 自动调 /auth/refresh → 拿新 token → 重试原请求 → 用户无感知
- refresh token 也过期时：清空 localStorage → 跳登录页
- 多个并发 401（如同时刷新多个看板）只会触发一次 /auth/refresh

## 文件变更

修改：
- `src/frontend/src/api/http.ts`（重写）
- `src/frontend/src/api/auth.ts`（加 refreshToken 字段 + refresh() 函数）
- `src/frontend/src/stores/auth.ts`（持久化 refresh token）
- `src/frontend/src/main.ts`（删除双套拦截器）
- `src/frontend/src/components/quality/QualityBoard.vue`（裸 axios → http）

## 推 P2 后续

- localStorage 存 token 仍是 XSS readable（P1-7 已修单引号但不是根治）。改 httpOnly cookie 是 P2-A 工作量
- 多标签页同步 token：当一个标签页 refresh 完，其他标签页没感知。可加 storage event 监听同步（v0.2）

## 从这里收尾

P1-6 是 Codex 第一轮指出的 8 项 P1 中最后一个未修的。本次修完后整个 review/codex 三轮评审产出全部完成（17/24 修复 + 7/24 推 P2）。
