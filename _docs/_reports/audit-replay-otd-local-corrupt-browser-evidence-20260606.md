# 2026-06-06 Audit Replay OTD 本地证据链损坏真实浏览器证据

## Result

PASS

## Scope

- A-track 精品化切片：`AuditDecisionReplayPanel.vue`
- 选片依据：最新 coverage 显示 `AuditDecisionReplayPanel.vue` 行覆盖率 `64.8%`，是当前最低覆盖且审计回放属于发布证据链入口。
- 本片不关闭 B-track 发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 观察仍需独立证据。

## Behavior

- 当 `localStorage.aimes_otd_evidence_chain` 为损坏 JSON 时，审计回放页显示 `OTD 证据链加载失败：本地审计证据链载荷损坏`。
- 页面保留基础回放卡片，避免审计入口白屏。
- OTD 证据指标为 `0`，不伪造 OTD 回放卡片。
- 损坏的本地证据链被清理。

## Code Changes

- `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
  - 读取 OTD 本地证据前新增损坏载荷检测，损坏时 fail-loud。
- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增真实 Chromium 用例：`OTD 本地证据链损坏时真实浏览器保留基础回放并告警`。
- `src/frontend/scripts/e2e.mjs`
  - 修复真实浏览器证据链构建入口：当前 Nuxt 包缺少 `node_modules/nuxt/bin/nuxt.mjs`，改为使用 `@nuxt/cli` 的 `runCommand('build')`，并把 e2e 临时目录同步到 `process.env`。

## Verification

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "OTD 本地证据链损坏"
```

Result:

- Nuxt production build succeeded.
- Chromium: `1 passed`.

## Notes

- RED evidence first failed because the alert did not contain `OTD 证据链加载失败`.
- After the fix, the first GREEN attempt showed the alert but proved the metric chip remains visible by design; the assertion was corrected to require metric value `0` and no OTD replay card.
- `package.json` / `package-lock.json` were already dirty in this workspace. A diagnostic `npm install` was run while investigating the missing Nuxt bin; no release gate is claimed from that action.
