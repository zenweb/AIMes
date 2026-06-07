# 2026-06-06 AnomalyBoard 异常分流写入失败 Chromium 证据

## 变更

- 新增异常管理 e2e：`异常分流证据写入失败时真实浏览器展示 fail-loud 且不伪造分流`。
- `dispatchEventLane` 捕获分流证据写入异常并展示 `异常分流确认失败`。
- 分流写入失败时不更新成功 trace，不把按钮切换成 `已确认分流`。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流证据写入失败"
```

结果：`1 passed`。
