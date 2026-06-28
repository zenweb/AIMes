# 2026-06-12 Plan：排产拖拽保存 PostgreSQL/staging 闭环

## 成功标准

- 真实 PostgreSQL 下 PATCH reschedule 不再 500。
- PATCH 后数据库窗口等于拖拽目标窗口。
- GET plan read model 返回同一窗口。
- 普通排产读接口不依赖 LLM API key 才能工作。

## 执行结果

- 根因定位：no-tracking 聚合写入 + PostgreSQL `xmin` 并发 token。
- 最小修复：新增 tracked 写加载方法，reschedule 写路径改用该方法。
- 次生阻断：GET plan 被 LLM 网关 eager initialization 阻断。
- 最小修复：LLM Kernel 延迟初始化。
- 验证：本地定向测试和 staging reschedule probe 全部通过。

## 下一片建议

继续排产页现有功能深挖，不扩新功能。下一片优先做真实浏览器证据：拖拽后刷新页面或重新进入排产页，确认 UI 从 GET read model 读回同一窗口。
