# ProductionBoard 完工证据失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`ProductionBoard` 完工提交后，OTD/质量证据归档失败的 fail-loud 证据。
- 目标：后端完工已提交但本地 OTD/质量证据写入失败时，真实浏览器必须显示错误，不伪造完工报告成功状态，不写入不完整证据链。

## 变更

- `src/frontend/tests/e2e/production.spec.ts`
  - 新增真实 Chromium 用例：`完工证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 用例在完工弹窗确认前让 `Storage.prototype.setItem` 对 `aimes_otd_evidence_chain` 抛错。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "完工证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `完工证据写入失败`。
- 错误说明包含 `后端完工已提交但 OTD/质量证据未归档`。
- 错误原因包含 `chromium completion evidence storage unavailable`。
- 完工报告 dialog 保留，便于用户重试或人工处置。
- 不展示 `完工报告已提交` 成功状态。
- `aimes_otd_evidence_chain` 未被写入不完整证据。

## 结论

- `ProductionBoard` 完工证据失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
