# Plan：Release Gate 当前工作树复核

## 成功标准

- 运行当前 release gate audit。
- 明确哪些门 PASS、哪些门 FAIL。
- 若 FAIL，记录 fail-loud 文档，不伪造人工签字或灰度观察。
- 执行敏感串、占位符、空白审计。

## 执行

1. 读取 release gate audit 脚本与当前 git/remote 状态。
2. 运行 `scripts/run-release-gate-audit.ps1` 输出当前工作树复核报告。
3. 读取 Attack Chain、Security signoff、Gray observation 三份阻断证据。
4. 写入 changelog/review/todo/issue/plan。
5. 执行收尾扫描。

## 当前结果

- Release gate audit：FAIL。
- PASS：Hosted CI、PostgreSQL/staging。
- FAIL：Attack Chain A/B/C、Security signoff、Gray observation。

## Stop Condition

本片停在 fail-loud 复核完成。下一步需要人完成 Attack Chain A/B/C 验证和安全签字，之后才能启动灰度观察。

