# 2026-05-27 Ultragoal 巡检问题修复验证

## 背景

本轮处理 `http://127.0.0.1:5173/scheduling/` 巡检汇总中暴露的问题：登录接口 500、多个演示链路 API 500、离线演示页面控制台噪声，以及甘特图在离线/演示模式下的递归更新警告。

## 已处理问题

- 登录页在本地开发服务下优先识别演示账号，`admin / admin123` 可直接进入 Dashboard，并自动开启 `aimes_offline_demo=true`。
- 当真实后端不可用且返回无响应或 5xx 时，演示账号回退到本地演示登录，避免 Nuxt 代理把后端不可用呈现为登录 500。
- 离线演示模式下启用轻量甘特图，避免 `dhtmlx-gantt` 在演示巡检中触发递归更新告警。
- 移除 Tailwind 入口中的 Google Fonts 远程 `@import`，让视觉巡检不再产生外部字体请求失败噪声。

## 验证证据

- `npm run build`：通过。
- `VITE_OFFLINE_DEMO=true VITE_SHOW_DEMO_HINTS=true npm run build`：通过，用于生产 preview 离线演示包。
- Playwright 系统 Chrome 巡检：`src/frontend/output/ultragoal-audit-preview-fixed/audit-report.json`。
- 巡检截图目录：`src/frontend/output/ultragoal-audit-preview-fixed/`。

## 巡检结果

- 登录后 URL：`http://127.0.0.1:4173/scheduling/dashboard`。
- 登录用户：`admin`，角色 `Admin`。
- 离线演示模式：`true`。
- 巡检页面：19 个。
- 巡检后仍停留登录页：0 个。
- 原始问题 API 命中数：0。
- 产品 API/网络错误数：0。
- 产品控制台错误数：0。
- 全部请求失败数：0。
- 全部控制台消息数：0。

## 原始问题复核

- `POST /api/v1/auth/login`：未再命中。
- `GET /api/v1/scheduling/anomaly-dispatch-records?take=12`：未再命中。
- `GET /api/v1/scheduling/monitoring-situation-escalations?take=8`：未再命中。
- `GET /api/v1/scheduling/risk-sla-review/latest`：未再命中。
- `GET /api/v1/llm/status`：未再命中。

## 备注

本轮没有改动真实后端 API 合约；修复范围集中在本地开发/离线演示边界，使“可演示 AI MES”在后端未启动时也能保持干净巡检证据。开发服务下仍可能出现 Nuxt HMR 源模块 `ERR_ABORTED`，最终验收以生产 preview 离线包为准。
