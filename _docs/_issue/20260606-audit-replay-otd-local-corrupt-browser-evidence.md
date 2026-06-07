# 2026-06-06 Issue - Audit Replay OTD 本地证据链损坏静默降级

## Status

Closed for this slice.

## Problem

`aimes_otd_evidence_chain` 本地载荷损坏时，底层读取工具会清理坏数据并返回空数组；审计回放页此前不会明确提示 OTD 证据链损坏，存在静默降级风险。

## Fix

- 在 `AuditDecisionReplayPanel.vue` 读取 OTD 证据链前检测本地 JSON/数组形态。
- 损坏时记录 `OTD 证据链加载失败：本地审计证据链载荷损坏`。
- 保留基础回放，不伪造 OTD 回放卡片。

## Evidence

- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "OTD 本地证据链损坏"`：PASS。

## Out Of Scope

- 不关闭 Hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察发布闸门。
- 不整理既有大范围依赖/lockfile 脏差异。
