# 2026-06-05 Issue - Document Upload Import Evidence Payload Guard

## Problem

`DocumentUpload.vue` 在启动时直接信任 `readCustomerOrderImportEvidenceBackendFirst()` 的返回值。若后端返回 HTML、代理错误页或非客户工单导入证据对象，组件会把 truthy 坏载荷写入 `customerOrderImport`。

## Impact

- 页面不会 fail loud。
- 指标区可能渲染 `undefined 单高风险已识别`。
- 用户会看到貌似已有导入状态的脏 UI，影响知识库/POC 证据链可信度。

## Fix

- 在写入 `customerOrderImport` 前增加 `isCustomerOrderImportEvidence()` 守卫。
- `null` 继续合法；非 `null` 坏载荷抛出 `后端返回非客户工单导入证据载荷`。
- catch 分支保留本地/空状态，并通过 assertive alert 暴露失败原因。

## Status

- 已修复并通过目标单测、lint、全量前端覆盖率验证。
