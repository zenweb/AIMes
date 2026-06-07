# 2026-06-07 AuditLogBoard 审计详情坏形状 fail-loud Chromium 证据

## 范围

- 目标：补齐审计日志列表点击详情时，详情接口 `200` 但返回非详情对象的真实 Chromium 证据。
- 约束：不扩新功能，只硬化既有审计日志详情入口。

## 发现

- 已有证据覆盖审计日志详情接口失败时不打开空弹窗并告警。
- 缺口：详情接口返回 `200 + { items: [] }` 时，页面把它当详情对象渲染。
- 红灯显示：
  - 单元测试中 Vue 渲染因 `detail.action` 缺失触发 `Cannot read properties of undefined (reading 'toLowerCase')`。
  - 真实 Chromium 中没有出现 `.audit-list-alert`，详情坏载荷没有 fail-loud。

## 处理

- `openDetail()` 在 `getAuditLogDetail(id)` 成功后增加 `AuditLogDetail` 基本形状校验。
- 非详情对象抛出 `${id} 后端返回非对象审计详情载荷`。
- 新增组件单元：详情坏形状时不打开详情弹窗并告警。
- 新增 e2e：`审计日志详情载荷非详情对象时真实浏览器不打开空弹窗并告警`。

## 证据

- 页面验证：
  - 点击 `查看审计日志详情：operator1 更新 Production wo-001`。
  - `.audit-list-alert` 展示 `审计日志详情加载失败`。
  - 告警包含 `audit-board-detail-shape 后端返回非对象审计详情载荷`。
  - `.detail-modal` 保持隐藏。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts -t "detail payload is not a detail object"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志详情载荷非详情对象"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
