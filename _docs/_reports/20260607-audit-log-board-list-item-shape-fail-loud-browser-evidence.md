# 2026-06-07 AuditLogBoard 审计列表单项坏形状 fail-loud Chromium 证据

## 范围

- 目标：补齐审计日志列表接口 `200` 且 `items` 是数组，但单条日志项缺少关键字段时的真实 Chromium 证据。
- 约束：不扩新功能，只硬化既有审计日志列表入口。

## 发现

- 已有证据覆盖审计日志列表接口失败和列表 `items` 非数组。
- 缺口：`items` 是数组，但某条日志项缺少 `action` 时，页面仍把它当日志对象渲染。
- 红灯显示：
  - 单元测试中页面触发 `log.action.toLowerCase()` 渲染错误。
  - 真实 Chromium 中没有出现 `.audit-list-alert`，单项坏载荷没有 fail-loud。

## 处理

- `load()` 在 `result.items` 是数组后继续校验每个元素是否满足 `AuditLog` 基本形状。
- 非日志对象抛出 `${auditId} 后端返回非对象审计日志载荷`。
- 新增组件单元：单条列表项坏形状时展示本地演示日志并告警。
- 新增 e2e：`审计日志列表单项载荷坏形状时真实浏览器展示本地演示日志 fail-loud`。

## 证据

- 页面验证：
  - `.audit-list-alert` 展示 `审计日志列表加载失败`。
  - 告警包含 `已显示本地演示日志`。
  - 告警包含 `audit-list-item-shape 后端返回非对象审计日志载荷`。
  - 本地演示日志 `operator1` 和 `Production` 仍可见。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts -t "one audit list item is not a log object"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "列表单项载荷坏形状"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
