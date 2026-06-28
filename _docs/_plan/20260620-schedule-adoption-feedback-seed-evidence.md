# 2026-06-20 Plan - Schedule 采纳反馈 seed 证据

## 成功标准
- 当前排产计划存在时，latest adoption feedback 能返回 200。
- 返回记录必须带原因说明、目标标签、trace 和 agentDecisionId。
- 排产页首屏显示“已有反馈”，不再长期停留在“无反馈”。

## 执行结果
- 已补集成 seed。
- 已补 Docker volume 恢复脚本。
- 已通过排产相关集成测试。

## 后续验证
- 前端 build。
- 真实浏览器确认 `/scheduling/adoption-feedback/latest` 为 200 且页面状态更新。

