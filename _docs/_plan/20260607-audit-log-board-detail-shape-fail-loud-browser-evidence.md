# 2026-06-07 Plan - AuditLogBoard 审计详情坏形状 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造审计日志详情返回 `200 + { items: [] }`。
- 页面必须展示 fail-loud 告警，包含 `审计日志详情加载失败` 和 `${auditId} 后端返回非对象审计详情载荷`。
- 详情弹窗必须保持关闭。
- 不扩展新功能，不改变发布闸门状态。

## 执行

1. 读取 `AuditLogBoard` 详情读取函数、现有单元和 e2e。
2. 确认已有详情接口失败证据，但缺少详情对象形状证据。
3. 先写组件单元和真实 Chromium e2e。
4. 观察红灯：单元暴露 `detail.action.toLowerCase()` 渲染错误，真实浏览器没有展示 fail-loud alert。
5. 为 `openDetail()` 增加运行时基本形状校验。
6. 跑组件定向单元和定向 e2e 并记录结果。

## 非目标

- 不扩大到全量 audit e2e 套件。
- 不改审计列表分页或筛选逻辑。
- 不关闭 B 轨发布闸门。
