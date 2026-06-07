# SkillMatrixPanel 停工复核补证改派重新放行真实浏览器证据

日期：2026-06-07

## 目标

补齐人员能力约束中“停工复核经主管补证改派后重新放行生产与排程”的真实 Chromium 证据：无有效替班候选触发停工复核后，主管复核与补证改派必须能恢复生产开工、排程约束和报表 OTD 证据，不能让阻断状态永久卡住或绕过放行证据。

## 本轮变更

- 本轮未修改产品代码。
- 复跑既有 e2e：`停工复核经主管补证改派后重新放行生产与排程`。
- 使用 Nuxt production build + Playwright Chromium 项目验证真实浏览器链路。

## 真实浏览器证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "停工复核经主管补证改派后重新放行生产与排程"
```

结果：

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\employee.spec.ts:197:3 › Employee 人员能力约束 › 停工复核经主管补证改派后重新放行生产与排程 (2.7s)
1 passed (7.7s)
```

验证点：

- 人员页在无有效替班候选时先生成停工复核阻断。
- 点击 `主管确认停工复核` 后，阻断进入 `reviewing`。
- 点击 `补证改派并重新放行` 后显示 `停工复核已重新放行`。
- 生成放行审计编号 `AUD-LABOR-RELEASE-20260520-001`。
- 阻断记录生成放行 trace `TRACE-LABOR-RELEASE-WO-013-OP-10`。
- 放行后的替班记录包含 `补证改派`。
- 生产页 `WO-013 / OP-10` 开工前读取到 `人员: EMP-006 替班已确认`。
- 生产开工资质弹窗显示 `替班已确认`、`孙八 · EMP-006` 和放行审计编号。
- 生产确认按钮可用。
- 排程页工程约束显示 `EMP-003 资质临期已生成 EMP-006 替班复核`。
- 排程页事件队列出现 `人员替班事件`。
- 报表页 OTD evidence chain 出现 `WO-013 淬火 / 回火 停工复核后重新放行`。
- 报表证据展示 `人员放行`、`重新放行` 和放行 trace。

## 边界

- 本轮是 A 轨真实浏览器证据，不关闭 B 轨发布闸门。
- 未跑完整 employee e2e 文件。
- 未覆盖后端持久化环境中的真实数据库读写；本轮仍是前端真实 Chromium + 本地证据链验证。
- Hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍未关闭。
