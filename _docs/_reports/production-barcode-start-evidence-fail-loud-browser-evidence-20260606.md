# ProductionBoard 扫码开工证据失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 选片依据：`StartQualificationPanel.vue` 当前 coverage summary 中行覆盖 60%、分支 0%，且生产开工是 MES 现场必经路径。
- 本片不改业务逻辑，只补真实 Chromium 证据：后端开工已提交后，如果扫码/OTD 开工证据无法归档，前端必须 fail loud，不能伪装成开工成功或已写入证据。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/production.spec.ts`
  - 新增 `扫码开工证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 通过真实浏览器输入 `WO-RUSH-9001`，进入扫码开工上下文，点击 `按扫码上下文开工`。
  - 在点击 `确认开工` 前覆盖 `Storage.prototype.setItem`，仅对 `aimes_otd_evidence_chain` 抛出 `chromium otd evidence storage unavailable`。
  - 断言页面显示 `开工证据写入失败，后端开工已提交但人员替班/扫码/OTD 证据未归档`。
  - 断言对话框仍保留，未显示 `已开工：CNC 精加工`，也未显示 `已写入生产开工证据`。
  - 断言 `aimes_otd_evidence_chain` 未产生伪造证据。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "扫码开工证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/production-board.test.ts`
  - 1 file passed。
  - 22/22 tests passed。

## 未通过/未覆盖项

- 当前 `eslint.config.cjs` 不覆盖 `tests/e2e/**/*.ts`，因此本片仍不能给出 e2e lint 通过证据。
- 本片只验证扫码开工 OTD 证据归档失败；人员替班开工证据归档失败已有 unit 覆盖，尚未追加真实 Chromium。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
