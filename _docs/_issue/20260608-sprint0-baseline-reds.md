# 2026-06-08 Sprint 0 Baseline Reds

## 状态

- 后端：GREEN
- 前端 lint/build：GREEN
- 前端 unit 默认命令：AMBER
- 前端 e2e：RED

## 红/黄项

### BL-20260608-001 前端 unit 默认并行 worker 超时

- 命令：`npm run test:unit`
- 结果：`335 passed` 但伴随 `15 unhandled errors`
- 类型：稳定性 / 测试基础设施
- 判断：当前不能把默认 unit 命令当作可信绿灯

### BL-20260608-002 前端 e2e 真实失败 13 项

- 命令：`npm run test:e2e -- --reporter=list`
- 结果：`345 passed / 13 failed`
- 失败集中：
  - `tests/e2e/admin.spec.ts`
  - `tests/e2e/audit.spec.ts`
  - `tests/e2e/chat.spec.ts`
  - `tests/e2e/report.spec.ts`
- 主题集中：
  - Agent 治理
  - 审计回放
  - ChatPanel 证据生成/跨模块联动
  - Report 到监控/治理的证据链

## 已排除的伪红

- 后端 Integration 初始大面积失败来自旧依赖图；强制 restore 后恢复为 `175 passed`。
- 后端 Unit 的 `HealthChecks.Rabbitmq` 版本冲突 warning 也来自旧依赖图；强制 restore 后消失。
