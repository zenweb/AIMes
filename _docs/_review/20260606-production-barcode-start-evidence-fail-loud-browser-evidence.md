# Review: ProductionBoard 扫码开工证据失败真实浏览器证据

日期：2026-06-06

## 结论

- 未发现本片新增阻断问题。
- 扫码开工证据归档失败路径已有真实 Chromium 证据。
- 页面没有把证据写入失败伪装成成功开工，也没有写入伪造 OTD 证据链。

## 证据

- 真实浏览器输入 `WO-RUSH-9001` 并进入扫码开工上下文。
- 点击 `按扫码上下文开工` 后进入开工确认，资质校验显示通过。
- 点击 `确认开工` 前让 `aimes_otd_evidence_chain` 写入抛出 `chromium otd evidence storage unavailable`。
- 页面显示 `开工证据写入失败，后端开工已提交但人员替班/扫码/OTD 证据未归档`。
- 对话框保持打开，`已开工：CNC 精加工` 与 `已写入生产开工证据` 均不可见。
- `aimes_otd_evidence_chain` 仍为 `null`，没有伪造开工证据。

## 剩余风险

- 本片未覆盖人员替班证据归档失败的真实 Chromium 路径；该路径目前由 unit 覆盖。
- `tests/e2e` 未纳入 ESLint 配置，e2e lint 证据缺失。
- B 轨道发布闸门仍缺外部/人工/时间窗口证据，不能声明发布完成。
