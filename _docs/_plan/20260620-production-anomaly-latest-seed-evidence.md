# 2026-06-20 Plan - 生产异常 latest 证据补种

## 目标
- 生产异常 latest 端点必须有稳定、可审计的当前记录支撑风险页和异常页启动。

## 步骤
1. 先用集成测试复现 latest 端点 404。
2. 在测试种子与 Docker 当前计划 SQL 中补齐生产异常事件。
3. 验证目标集成测试通过。
4. 验证 Docker API 直接读取返回 200。
5. 用真实浏览器验证风险页与异常页无生产异常 latest 错误。

## 成功标准
- `/api/v1/scheduling/production-anomaly-event/latest` 返回 200。
- 页面无 404、无 Offline demo、无加载失败文案。
