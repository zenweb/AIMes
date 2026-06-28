# 2026-06-13 Issue: 剩余发布闸门为灰度观察

## 当前状态

- Hosted CI：PASS。
- PostgreSQL/staging：PASS。
- Attack Chain A/B/C：PASS。
- Security signoff：PASS。
- Gray observation：OBSERVING，但 release gate 仍为 FAIL。

## 未关闭原因

- 首次灰度启动证据已落盘：`_docs/_reports/gray-observation-20260611-observing.md`。
- 14 calendar days 的 P0/P1=0 观察窗口尚未完成；当前开始时间为 `2026-06-13T21:38:09+08:00`。

## 证据弱点

- Attack Chain A 人工验证证据文本引用 `_docs/_reports/attack-chain-A-screenshot.png`。
- 当前工作树未发现该截图文件；虽然 gate 脚本已通过，但人工审计材料建议补齐该文件。

## 处理策略

- 不伪造灰度 PASS 或观察结束证据。
- 使用已落盘的 `OBSERVING` 报告继续观察，不回退到旧的 `NOT_STARTED` 状态。
- 等满 14 天且 P0/P1=0 后生成 `PASS` 报告并重跑 release gate audit。
- 最早 PASS 时间不得早于 `2026-06-27T21:38:09+08:00`。
