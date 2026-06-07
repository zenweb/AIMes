# 2026-06-07 Plan - AuditDecisionReplayPanel 助手动作审计坏载荷 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造助手动作审计接口返回 200 非数组载荷。
- 页面必须展示 fail-loud 告警，包含 `助手动作审计加载失败` 和 `后端返回非数组审计载荷`。
- 基础回放卡片必须仍可见。
- Admin 等非审计调用默认 fallback 行为不被改变。

## 执行

1. 读取助手动作审计同步工具、审计回放组件和现有单元测试。
2. 新增真实 Chromium e2e，并先验证红灯。
3. 为助手动作审计查询增加可选 fail-loud 模式。
4. 仅在 `AuditDecisionReplayPanel` 启用 fail-loud。
5. 补运行时数组校验，覆盖 200 非数组载荷。
6. 跑助手动作审计工具单元、组件定向单元、定向 e2e 并记录结果。

## 非目标

- 不扩大到全量 audit e2e 套件。
- 不改变 Admin 侧助手动作审计加载 fallback 策略。
- 不关闭 B 轨发布闸门。
