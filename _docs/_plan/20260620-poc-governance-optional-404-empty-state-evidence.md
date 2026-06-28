# 2026-06-20 Plan - POC 证据治理 optional 404 空状态证据

## 成功标准
- `/scheduling/admin` 不展示 POC 证据治理 optional 404 告警。
- `/scheduling/audit-logs` 不展示 POC 证据治理 optional 404 告警。
- optional latest 404 不触发全局 `请求错误` toast。
- 单测锁定治理聚合空状态行为。

## 执行结果
- 已补 `readPocEvidenceGovernanceRecordsBackendFirst()` 的 optional 404 空状态单测。
- 已跑聚焦单测、构建和真实浏览器验证。

