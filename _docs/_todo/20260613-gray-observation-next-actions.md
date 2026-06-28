# 2026-06-13 TODO: 灰度观察后续

- 补齐或更正 Attack Chain A 截图证据路径：当前 `_docs/_reports/attack-chain-A-screenshot.png` 未落盘。
- 灰度已启动：`gray-v1.0.0-20260613-001`，观察开始时间 `2026-06-13T21:38:09+08:00`。
- 不要再使用旧的 NOT_STARTED 报告作为 release gate 输入；使用 `_docs/_reports/gray-observation-20260611-observing.md` 或已同步的 `_docs/_reports/gray-observation-latest.md`。
- 观察满 14 天后，以真实 incident/monitoring 查询证明 P0=0、P1=0，再生成 `PASS` 报告。按当前开始时间，最早可在 `2026-06-27T21:38:09+08:00` 之后生成 PASS。
- 灰度 `PASS` 后重跑 final release gate audit；只有全部 gate 为 PASS 才能关闭 v1.0.0。
