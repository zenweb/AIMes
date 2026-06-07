# ProductionBoard 人员替班开工证据失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 选片依据：生产开工是 MES 现场必经路径，人员替班是开工资质约束闭环的一部分。
- 本片不改业务逻辑，只补真实 Chromium 证据：后端开工已提交后，如果人员替班/OTD 开工证据无法归档，前端必须 fail loud，不能伪装成开工成功或已写入 START 证据。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/production.spec.ts`
  - 新增 `人员替班开工证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 通过真实浏览器从人员管理页点击 `生成替班建议`，产生 `AUD-LABOR-REASSIGN-20260520-001 / TRACE-LABOR-REASSIGN-WO-013-OP-10`。
  - 切到生产页打开 `WO-013` 的 `OP-10 淬火`，确认开工前校验读取 `EMP-006` 替班证据。
  - 在点击 `确认开工` 前覆盖 `Storage.prototype.setItem`，仅对 `aimes_otd_evidence_chain` 抛出 `chromium labor reassignment evidence storage unavailable`。
  - 断言页面显示 `开工证据写入失败，后端开工已提交但人员替班/扫码/OTD 证据未归档`。
  - 断言对话框仍保留，未显示 `已开工：淬火`。
  - 断言 `aimes_otd_evidence_chain` 未产生 `TRACE-LABOR-REASSIGN-WO-013-OP-10-START` 伪造证据。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "人员替班开工证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/production-board.test.ts`
  - 1 file passed。
  - 22/22 tests passed。

## 未通过/未覆盖项

- 当前 `eslint.config.cjs` 不覆盖 `tests/e2e/**/*.ts`，因此本片仍不能给出 e2e lint 通过证据。
- 本片只验证人员替班开工证据归档失败；没有扩大新功能范围。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
