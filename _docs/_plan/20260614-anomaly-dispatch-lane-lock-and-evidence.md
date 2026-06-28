# 2026-06-14 Plan - Anomaly 分流通道锁定与证据链

## 成功标准
- 异常分流确认成功后，对应按钮必须锁定。
- 重复点击不能再次写入同一分流证据。
- 真实浏览器链路能看到已确认分流按钮处于 disabled 状态。

## 执行
1. 先写单测，证明旧代码不会锁定已确认分流按钮。
2. 最小修改 AnomalyBoard 模板和执行入口。
3. 补 Chromium e2e 断言已确认分流按钮 disabled。
4. 回跑 focused unit、focused Chromium、全量 unit coverage。

