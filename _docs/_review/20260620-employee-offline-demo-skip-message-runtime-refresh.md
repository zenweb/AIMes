# 2026-06-20 Review: 员工列表离线演示跳过请求静默兜底

## 结论

PASS。

## 审查点

- 员工页保留真实后端失败的 fail-loud 行为：普通 API 错误仍显示“员工列表加载失败，当前展示本地示例数据”。
- offline demo skip 被识别为预期演示路径，不再污染用户界面。
- 真实浏览器证据确认当前 4173 入口已加载新 bundle，员工卡片可见且无告警。

## 风险

- 工作树存在大量既有脏文件，本次审查仅覆盖员工列表 offline demo skip 相关文件与运行入口。
- Nuxt dev 模式仍存在历史 `No entry found in rollupOptions.input` 阻塞；本次使用 production preview `4173` 验证，不代表 dev server 阻塞已修复。

## 证据

- Unit: 31 passed。
- Lint: PASS。
- Diff check: PASS，仅 CRLF warning。
- Browser: `/scheduling/employee?offlineDemo=1` 显示 `人员管理`、`EMP-001`、`张三`，无 skip 文案。
