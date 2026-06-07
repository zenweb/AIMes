# 2026-06-06 Audit Replay OTD 本地证据链损坏真实浏览器证据

- 按覆盖率杠杆选择 `AuditDecisionReplayPanel.vue`，当前行覆盖率约 `64.8%`，且审计回放是发布证据链入口。
- 新增 OTD 本地证据链损坏 fail-loud：`aimes_otd_evidence_chain` 不是合法数组时，页面展示 `OTD 证据链加载失败：本地审计证据链载荷损坏`。
- 新增真实 Chromium e2e：`OTD 本地证据链损坏时真实浏览器保留基础回放并告警`，验证基础回放保留、OTD 指标为 0、不伪造 OTD 回放卡片、坏载荷被清理。
- 修复 e2e 构建入口：当前安装的 Nuxt 包缺少 `node_modules/nuxt/bin/nuxt.mjs`，`scripts/e2e.mjs` 改用 `@nuxt/cli` 的 `runCommand('build')`，并同步 e2e 临时目录环境变量。
- 验证：`npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "OTD 本地证据链损坏"` 通过，Chromium `1 passed`。
- 发布闸门提醒：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察仍未关闭。
