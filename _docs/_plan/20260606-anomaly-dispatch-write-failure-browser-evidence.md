# Plan：AnomalyBoard 异常分流写入失败真实浏览器证据

## 成功标准

- Chromium 中模拟 `aimes_anomaly_dispatch_records` 写入失败。
- 点击 `装配间隙超差` 的 `确认分流`。
- 页面展示分流失败告警。
- 按钮保持 `确认分流`。
- 成功分流 trace 不出现。

## 执行

1. 根据覆盖率报告选择低覆盖且用户关键的 `AnomalyBoard.vue`。
2. 读取现有异常管理 e2e，确认成功分流已有证据。
3. 新增 RED Chromium 用例，模拟分流证据写入失败。
4. 最小修复 `dispatchEventLane` 的失败处理。
5. 跑目标 Chromium 用例。
6. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流证据写入失败"
```

结果：`1 passed`。
