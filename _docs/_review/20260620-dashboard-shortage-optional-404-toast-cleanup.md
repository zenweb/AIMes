# 2026-06-20 Review - Dashboard 短缺证据 optional 404 toast 清理

## 结论
- 通过。首屏 Dashboard 不再因短缺 optional latest 404 弹出全局 `请求错误`。

## 审计点
- optional 404：作为空状态处理，不再制造 toast 噪声。
- 非 404 真实失败：`failLoud` 仍会抛出，未被吞掉。
- 变更范围：仅 `shortageEvidence` API 合同层与对应测试，未改 Dashboard 展示逻辑。

## 剩余风险
- 本轮扫查仍发现 `/scheduling/scheduling`、`/scheduling/risk`、`/scheduling/bom`、`/scheduling/purchase` 等页面存在其它 optional latest 404 toast，需后续逐片处理。

