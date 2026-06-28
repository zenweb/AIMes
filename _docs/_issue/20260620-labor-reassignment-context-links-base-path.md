# 2026-06-20 Issue - 人员替班关联入口跳出应用 Base Path

## 现象
- 人员替班帮助区使用 `/production`、`/scheduling`、`/audit-logs` 根路径链接。
- 当前前端应用部署在 `/scheduling/` 下，根路径链接会跳到错误地址。

## 根因
- 复杂操作帮助区使用了未带应用 base path 的原生 href。

## 修复
- 将跨模块链接修正为 `/scheduling/...`。
- 保留锚点帮助链接 `#labor-reassignment-help`。

## 状态
- 已修复并通过单测、构建和真实浏览器验证。
