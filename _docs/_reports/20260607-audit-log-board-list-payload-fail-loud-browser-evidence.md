# 2026-06-07 AuditLogBoard 审计列表坏载荷 fail-loud Chromium 证据

## 范围

- 目标：补齐审计日志列表接口 `200` 但 `items` 非数组时的真实 Chromium 证据。
- 约束：不扩新功能，只硬化既有审计日志列表入口。

## 发现

- 已有证据覆盖审计日志列表接口失败时展示本地演示日志并 fail-loud。
- 缺口：列表接口返回 `200 + { items: { rows: [] } }` 时，页面把非数组当成日志集合渲染。
- 红灯显示：
  - 单元测试中页面尝试渲染坏日志项并触发 `log.action.toLowerCase()` 错误。
  - 真实 Chromium 中没有出现 `.audit-list-alert`，列表坏载荷没有 fail-loud。

## 处理

- `load()` 在 `getAuditLogs()` 成功后增加 `Array.isArray(result.items)` 校验。
- 非数组载荷抛出 `后端返回非数组审计日志载荷`。
- 新增组件单元：列表 `items` 非数组时展示本地演示日志并告警。
- 新增 e2e：`审计日志列表载荷非数组时真实浏览器展示本地演示日志 fail-loud`。

## 证据

- 页面验证：
  - `.audit-list-alert` 展示 `审计日志列表加载失败`。
  - 告警包含 `已显示本地演示日志`。
  - 告警包含 `后端返回非数组审计日志载荷`。
  - 本地演示日志 `operator1` 和 `Production` 仍可见。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts -t "audit list payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志列表载荷非数组"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
