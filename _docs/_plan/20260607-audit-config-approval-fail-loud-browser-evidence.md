# 2026-06-07 Plan - AuditDecisionReplayPanel 配置审批失败 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造配置审批接口 503。
- 页面必须展示 fail-loud 告警，包含 `配置审批加载失败` 和后端错误消息。
- 基础回放卡片必须仍可见。
- 待审批数必须归零，避免显示旧审批状态。
- Admin 等非审计调用默认 fallback 行为不被改变。

## 执行

1. 读取配置审批同步工具、审计回放组件和现有单元测试。
2. 新增真实 Chromium e2e，并先验证红灯。
3. 为配置审批查询增加可选 fail-loud 模式。
4. 仅在 `AuditDecisionReplayPanel` 启用 fail-loud。
5. 跑同步工具单元、组件定向单元、定向 e2e 并记录结果。

## 非目标

- 不扩大到全量 audit e2e 套件。
- 不改变 Admin 侧配置审批加载 fallback 策略。
- 不关闭 B 轨发布闸门。
