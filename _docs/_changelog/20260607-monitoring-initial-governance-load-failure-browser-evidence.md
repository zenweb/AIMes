# 2026-06-07 MonitoringBoard 初始化治理证据加载失败 Chromium 证据

## 变更

- 新增 Monitoring e2e：`初始化治理证据加载失败时真实浏览器展示 fail-loud 且保留现场态势入口`。
- 修复 Hypercare 与现场态势处置包初始化读取失败被 helper 吞成 `null` / `[]` 的缺口。
- 为相关读取增加可选 `failLoud` 模式，MonitoringBoard 初始化使用 fail-loud，其他调用保持默认本地回退。
- 补充 helper 单元回归，确保后端失败能被需要 fail-loud 的页面感知。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts -t "throws monitoring escalation backend failures"
npm.cmd run test:unit -- tests/unit/poc-hypercare-sync.test.ts -t "throws hypercare backend failures"
npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts -t "initial monitoring governance records"
npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts -g "初始化治理证据加载失败"
```

结果：三个 Vitest 定向用例通过，Nuxt production build passed，Chromium `1 passed`。
