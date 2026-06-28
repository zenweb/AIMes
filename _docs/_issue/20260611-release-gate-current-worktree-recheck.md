# Issue：Release Gate 仍被人工/墙钟门阻断

## 状态

未关闭。

## 问题

当前自动化测试和真实浏览器证据已经很强，但 v1.0.0 的 release gate 仍要求：

- Attack Chain A/B/C 人工验证 PASS。
- Human security signoff SIGNED。
- 首次灰度后 14 天 P0/P1=0。

这些证据当前缺失，release gate audit 因此 FAIL。

## 证据

- `_docs/_reports/release-gate-audit-20260611-current-worktree-recheck.md`
- `_docs/_reports/attack-chain-verification-20260611-manual-pending.md`
- `_docs/_review/20260607-security-signoff.md`
- `_docs/_reports/gray-observation-20260607-not-started.md`

## 当前阻断项

- Attack Chain A/B/C：`PENDING_MANUAL_VERIFICATION`
- Security signoff：`UNSIGNED`
- Gray observation：`NOT_STARTED`

## 决策

不得把本地自动化 PASS 或 hosted CI PASS 宣称为 v1.0.0 release-ready。必须先关闭上述三个门。

