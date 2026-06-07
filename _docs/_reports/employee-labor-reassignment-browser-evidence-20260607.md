# SkillMatrixPanel 资质临期替班闭环真实浏览器证据

日期：2026-06-07

## 目标

补齐人员能力约束中“资质临期生成替班建议”的真实 Chromium 证据：人员页生成替班建议后，必须进入报表 OTD 证据链和审计回放，不能只在人员页显示本地成功。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`资质临期生成替班建议并进入报表与审计回放`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "资质临期生成替班建议"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\employee.spec.ts:313:3 › Employee 人员能力约束 › 资质临期生成替班建议并进入报表与审计回放 (2.4s)
1 passed (6.8s)
```

验证点：

- 人员页 `.skill-matrix-panel` 点击 `生成替班建议` 后显示 `替班建议已同步生产开工与 OTD 复盘`。
- 生成审计编号 `AUD-LABOR-REASSIGN-20260520-001`。
- 生成 trace `TRACE-LABOR-REASSIGN-WO-013-OP-10`。
- 报表页 OTD evidence chain 出现 `WO-013 淬火 / 回火 资质临期替班已确认`。
- 报表证据展示 `人员替班`、`已替班` 和替班 trace。
- 审计页回放指标出现 `人员替班回放 1`。
- 审计卡片展示 `人员替班：WO-013 淬火 / 回火 资质临期替班已确认`。
- 审计详情包含临期资质、候选评分、替班人员、主管复核、补证放行状态和排产释放窗口。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整 employee e2e 文件。
- 未覆盖“无有效替班候选停工复核”和“主管补证改派重新放行”两条相邻闭环。
- Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
