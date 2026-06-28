# 2026-06-20 Issue - POC 证据治理 optional 404 被误判风险

## 现象
- 真实浏览器扫页时，`/scheduling/admin` 与 `/scheduling/audit-logs` 曾出现 POC 证据治理相关用户可见失败提示风险。

## 根因
- POC 治理依赖两个 optional latest 端点。端点无记录时返回 404 是合理空状态，但缺少聚合层回归测试，容易退化成页面告警或全局 toast。

## 处理
- 补充聚合层测试，确认两路 optional latest 404 返回 `[]`。
- 验证 API 请求携带 `suppressErrorToast`。
- 用真实浏览器确认 admin/audit-logs 页面不再把 optional 404 展示成失败。

## 状态
- 已关闭。

