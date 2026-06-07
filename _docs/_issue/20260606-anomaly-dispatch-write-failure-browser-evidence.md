# Issue：AnomalyBoard 异常分流写入失败会静默返回

## 状态

已修复并补齐真实 Chromium 证据。

## 风险

现场事件中心是异常进入风险队列、AI 排产复核和 OTD 审计的入口。若分流证据写入失败却不告警，操作者无法判断下游闭环是否真实建立，容易造成异常已处理的错觉。

## RED 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流证据写入失败"
```

失败表现：页面没有出现 `异常分流确认失败`，仍显示旧的异常列表 fallback 告警。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流证据写入失败"
```

结果：`1 passed`。

## 当前表现

- 写入失败时展示 `异常分流确认失败`。
- 写入失败时保留按钮 `确认分流`。
- 写入失败时不展示成功分流 trace。
