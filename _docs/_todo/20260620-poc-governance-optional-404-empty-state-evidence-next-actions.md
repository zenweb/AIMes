# 2026-06-20 Todo - POC 证据治理 optional 404 空状态后续

## 下一步
- 继续真实浏览器扫核心页面，优先处理用户必经路径里仍可见的 optional 404、offline skip 或误导性 fallback 文案。
- 对非 optional 的后端失败保持 fail-loud，不把真实数据缺失伪装成空状态。
- 后续若新增 POC latest 端点，必须同步补 `suppressErrorToast` 与 404 空状态测试。

