# Review: ScheduleBoard 外协排产释放证据

日期：2026-06-06

## 结论

- 未发现本片新增阻断问题。
- `ScheduleBoard` 外协到货释放链路已有单元证据和真实 Chromium 证据。
- 真实浏览器用例验证了 UI 呈现、外协包写入和 OTD 证据链写入，不只是按钮可点击。

## 证据

- 新增 e2e 将 `product-flange` 设置为“外协到货已确认、尚未排产释放”。
- 点击 `复核排产影响` 后显示 `外协到货后的排产释放复核`。
- 点击 `采纳此建议` 后显示 `外协排产释放已确认`、释放 trace、释放审计号、`OTD +2% 已释放归档`、`延期 0 单外部等待`。
- 释放后的事件卡显示 `已释放`，并包含 `TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521`。
- localStorage 中 `aimes_outsourcing_commitment_packages` 和 `aimes_otd_evidence_chain` 均写入释放 trace。

## 剩余风险

- `tests/e2e` 不在当前 ESLint 配置内，e2e lint 证据缺失。
- 本片没有扩大功能，也没有关闭 B 轨道发布闸门。
