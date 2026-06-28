# Plan：Release Gate 收尾路径

## 当前状态

- Hosted CI: PASS
- PostgreSQL/staging: PASS
- Attack Chain A/B/C: FAIL
- Security signoff: FAIL
- Gray observation: FAIL

## 收尾顺序

1. 先完成人工 Attack Chain A/B/C 验证。
2. 再由人类 signer 完成 security signoff。
3. 再启动 first gray release。
4. 观察 14 calendar days。
5. 最后重新运行 release gate audit。

## 成功条件

- 不是“脚本又跑了一遍”，而是每个 gate 都拿到它要求的那类证据。
- 只有 `release-gate-audit` 五项全 PASS，目标才算关闭。
