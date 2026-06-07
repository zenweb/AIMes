# SkillMatrixPanel 无有效替班候选停工复核真实浏览器证据

日期：2026-06-07

## 目标

补齐人员能力约束中“无有效替班候选时生成停工复核阻断”的真实 Chromium 证据：当热处理资质临期且没有有效替班候选时，页面必须生成停工复核阻断，进入报表 OTD 证据链和审计回放，不能伪造替班建议或放行生产。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`无有效替班候选时生成停工复核阻断`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "无有效替班候选时生成停工复核阻断"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\employee.spec.ts:153:3 › Employee 人员能力约束 › 无有效替班候选时生成停工复核阻断 (2.2s)
1 passed (7.5s)
```

验证点：

- 人员页加载无有效候选的员工数据后展示 `未找到有效替班候选，需阻断开工并升级主管复核`。
- 点击 `生成替班建议` 后没有写入 `aimes_labor_reassignment`。
- 页面生成停工复核审计编号 `AUD-LABOR-BLOCK-20260520-001`。
- 页面生成 trace `TRACE-LABOR-BLOCK-WO-013-OP-10`。
- 本地阻断记录状态为 `active`。
- 报表页 OTD evidence chain 出现 `WO-013 淬火 / 回火 无有效替班候选需停工复核`。
- 报表证据展示 `人员阻断`、`停工复核` 和阻断 trace。
- 审计页回放指标出现 `人员阻断回放 1`。
- 审计卡片展示 `人员阻断：WO-013 淬火 / 回火 无有效替班候选需停工复核`。
- 审计详情包含技能缺口、证书临期、班组/班次、排班可用性、复核授权、阻断工序和重新放行条件。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整 employee e2e 文件。
- 未覆盖“主管补证改派并重新放行生产与排程”相邻恢复闭环。
- Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
