# PurchaseBoard 供应商绩效 SLA 选优真实浏览器证据

日期：2026-06-07

## 目标

补齐采购协同中“供应商绩效、交付 SLA 与多承诺比较”路径的真实 Chromium 证据：供应网络选优后，必须从采购页进入排产复核、OTD 报表证据链和审计回放，不能只停留在本页状态变化。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`供应商绩效 SLA 选优进入排产复核和 OTD 审计`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "供应商绩效 SLA"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\purchase.spec.ts:330:3 › Purchase 采购协同 › 供应商绩效 SLA 选优进入排产复核和 OTD 审计 (2.0s)
1 passed (7.1s)
```

验证点：

- 采购页 `.supplier-network-panel` 展示供应商候选、SLA 违约和选优入口。
- 点击 `选优供应商并生成 SLA 决策` 后显示 `供应网络已选优`。
- 证据 trace `TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA` 在采购页可见。
- 排产页事件队列出现 `MAT-B02 供应商绩效与 SLA 选优`，状态为 `已选优`。
- 排产复核建议显示 `供应商 SLA 选优后的排产复核`。
- 报表页 OTD evidence chain 出现 `MAT-B02 供应商绩效与 SLA 选优已确认`。
- 审计页回放指标出现 `供应网络回放 1`。
- 审计回放详情包含供应商绩效、准交率、SLA、报价、产能、违约状态和复盘判断口径。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整采购 e2e 文件。
- Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
