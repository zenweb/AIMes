# Plan: SkillMatrixPanel 人员证据同步写入失败浏览器证据

## 成功标准

- 真实 Chromium 中点击 `同步人员证据`。
- `aimes_otd_evidence_chain` 写入失败时显示 fail-loud 告警。
- 不显示同步成功文案。
- 不伪造本地 OTD 人员能力证据。

## 执行

- 选片：`SkillMatrixPanel.vue` 行覆盖率约 72.83%，且人员能力约束是生产开工、替班、停工复核、报表和审计的关键输入。
- 放弃项：不继续尝试 `ScheduleBoard` 拖拽重排真实浏览器像素拖拽，因为当前轻量 Gantt 路径不稳定，已有单元测试覆盖该保存失败行为。
- 实现：只新增 e2e，不改产品代码。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/employee.spec.ts -g "人员证据同步写入失败"
```

结果：`1 passed`。
