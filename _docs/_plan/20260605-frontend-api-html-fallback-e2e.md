# 2026-06-05 Plan - Frontend API HTML Fallback E2E

## 成功标准
- Demo 主链路在无后端 preview 环境中不把 SPA HTML 当 API 数据。
- `Dashboard -> Scheduling -> Audit -> Report` 能完成审计回放和 OTD 报表断言。
- 变更保持在现有关键路径精品化，不新增功能。

## 执行步骤
1. 复现并确认审计页空 `main` 不是 selector/等待问题。
2. 对比直接离线进入审计/报表与前置排产后进入的差异。
3. 在 HTTP API 边界阻断 HTML fallback。
4. 在排产页补充后端载荷守卫。
5. 单跑红灯用例、跑窄范围组合、跑 lint。
