# AnomalyBoard 异常分流写入失败真实浏览器证据

日期：2026-06-06

## 目标

补齐异常管理现场事件中心的 fail-loud 证据：异常分流证据写入失败时，页面必须告警，不能把分流按钮改成已确认，也不能显示成功分流 trace。

## 选片依据

- 当前覆盖率报告显示 `AnomalyBoard.vue` 行覆盖率约 71.12%，低于采购、库存等近期已精修组件。
- 异常分流是设备、质量、物料事件进入风险队列、排产复核、OTD 审计的用户关键路径。
- 既有 e2e 已覆盖成功分流长链路，但缺少写入失败时“不伪造成功”的真实 Chromium 证据。

## 本轮变更

- 在 `src/frontend/tests/e2e/anomaly.spec.ts` 新增 `异常分流证据写入失败时真实浏览器展示 fail-loud 且不伪造分流`。
- 在 `src/frontend/src/components/anomaly/AnomalyBoard.vue` 为 `dispatchEventLane` 增加写入失败处理：
  - 捕获 `writeAnomalyDispatchRecord` 抛出的错误。
  - `writeAnomalyDispatchRecord` 返回 `null` 时也 fail loud。
  - 失败时不更新 `latestDispatch`。
  - 失败时不更新 `dispatchedLaneIds`。

## RED 证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流证据写入失败"
```

失败表现：

```text
Expected substring: "异常分流确认失败"
Received string: "异常列表加载失败，已显示本地演示异常：Offline demo mode skipped backend request: /api/v1/anomaly"
```

说明：真实 Chromium 中模拟 `aimes_anomaly_dispatch_records` 写入失败后，页面没有展示分流失败告警，仍停留在旧的列表 fallback 告警。

## GREEN 证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "异常分流证据写入失败"
```

结果：

```text
1 passed
```

验证点：

- Chromium 打开异常管理页。
- 覆盖 `Storage.prototype.setItem`，让 `aimes_anomaly_dispatch_records` 写入抛出 `anomaly dispatch storage unavailable from chromium`。
- 点击质量异常 `装配间隙超差` 的 `确认分流`。
- `.anomaly-notification` 展示 `异常分流确认失败` 和底层错误。
- 质量异常按钮仍为 `确认分流`。
- `.dispatch-trace` 不出现，避免伪造分流成功。

## 边界

- 本轮只修复异常分流写入失败路径，未扩展新功能。
- 未全量重跑 `anomaly.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
