# 2026-06-20 Plan - 质量 latest 证据种子恢复

## 成功标准
- `/quality-rework-impact/latest` 返回 200。
- `/quality-mrb-disposition/latest` 返回 200。
- `/quality-capa-closure/latest` 返回 200。
- report / audit-logs / quality 真实浏览器页面不再因 quality latest 产生请求错误或 fallback。

## 执行
1. 读取 DTO、endpoint、service 映射与现有测试辅助类型。
2. 先写失败集成测试，确认当前缺种子导致 404。
3. 在 `TestDataSeedFilter` 中补 deterministic quality evidence chain。
4. 在 `db/ensure-current-schedule-plan.sql` 中补 Docker 当前库恢复 SQL。
5. 执行 SQL，跑 API、集成测试和真实浏览器验证。

## 状态
- 已完成并验证。
