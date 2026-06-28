# 2026-06-14 Plan - ChatPanel BOM 齐套动作锁定与证据链

## 成功标准
- ChatPanel 中 BOM 展开齐套检查包动作成功后必须锁定。
- 重复点击不能再次写入同一包的证据链。
- 真实浏览器链路里能看到按钮锁定。

## 执行
1. 先写单测，证明旧代码不会锁定动作按钮。
2. 最小修改 ChatPanel，只对 BOM 齐套动作加入成功后锁定。
3. 补 Chromium e2e 断言按钮 disabled。
4. 回跑 focused unit、focused Chromium、全量 unit coverage。

