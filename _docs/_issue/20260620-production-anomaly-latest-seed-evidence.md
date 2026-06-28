# 2026-06-20 Issue - 生产异常 latest 缺少当前证据

## 现象
- `/scheduling/risk` 与 `/scheduling/anomaly` 会请求 `/api/v1/scheduling/production-anomaly-event/latest`。
- 缺少当前记录时，latest 端点返回 404，真实浏览器证据不能闭环。

## 根因
- 集成测试种子与 Docker 当前计划 SQL 未包含生产异常 latest 当前证据。

## 修复
- 增加生产异常事件种子。
- 增加对应集成测试。
- 将当前证据写入 `db/ensure-current-schedule-plan.sql`。

## 状态
- 已修复并通过真实浏览器验证。
