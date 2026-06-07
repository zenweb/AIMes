# ScheduleBoard 急单插单多方案决策包真实浏览器证据

日期：2026-06-07

## 目标

补齐排产主路径中“急单插单、多方案比较、人工采纳与 OTD 复盘”的真实 Chromium 证据：急单插单不能只在排产页生成建议，还必须留下反馈记录、决策快照，并进入报表 OTD 证据链。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`急单插单生成多方案决策包并进入 OTD 复盘`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单插单生成多方案决策包"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\scheduling.spec.ts:602:3 › Scheduling 排产甘特图 › 急单插单生成多方案决策包并进入 OTD 复盘 (2.5s)
1 passed (5.7s)
```

验证点：

- 排产页 `.event-queue-panel` 可从 `WO-RUSH-9001 客户插单` 生成重排建议。
- 决策包 `.scenario-package` 展示 `Agent 多方案决策包`。
- 多方案比较包含 `加班插入`、`强插当前窗口`、`换设备插入`。
- 决策口径展示 `OTD 改善最高`，并标出 `破坏锁定期并扩大换线成本` 的未选风险。
- 点击 `采纳此建议` 后，反馈记录显示 `已采纳 Agent 推荐`。
- 反馈记录包含 `推荐方案：加班插入` 与 `未选方案：强插当前窗口`。
- `localStorage.aimes_schedule_feedback_snapshot` 保留推荐方案、未选方案和换设备插入备选信息。
- 报表页 `.otd-evidence-chain` 出现 `急单插入重排建议`。
- 报表 OTD 证据链展示 `人工采纳`、推荐方案和未选方案说明。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整排产 e2e 文件。
- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
