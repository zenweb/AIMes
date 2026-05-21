# 2026-05-21 工艺路线能力校验闭环

## 触发

功能深化计划中 `工艺路线` 被标记为“可演示，缺能力匹配”。现有页面能展示设备能力、质量门和节拍，但缺少把工艺能力缺口确认、制造放行、排产事件和 OTD 审计串成闭环的动作。

## 产出

- 更新 `src/frontend/src/utils/engineering-change-sync.ts`
- 更新 `src/frontend/src/components/routing/RoutingBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
- 更新 `src/frontend/tests/e2e/engineering-data.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `工艺路线` 新增 `R-B200 OP-090` 热处理能力校验卡。
- 点击“运行能力校验”后记录热处理炉 `HT-01` 的 `4.5h` 能力缺口。
- 点击“确认分流/合批方案”后锁定 `HT-02 夜班窗口 / 外协 HT-SUP-01`，并生成审计编号与追踪编号。
- 工艺能力记录写入统一 OTD 证据链，阶段为 `工艺能力校验` 或 `工艺能力放行`。
- `AI 排产` 工程约束面板读取该记录，把热处理能力缺口更新为可审计的分流/合批约束。
- `AI 排产` 事件队列新增 `工艺能力` 事件，并可生成热处理分流确认后的排产复核建议。
- `报表中心` 与 `审计日志` 通过 OTD 证据链回放工艺能力校验、放行和排产复核链路。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`
- 通过：`npm run test:e2e -- tests/e2e/engineering-data.spec.ts`，5 passed。

## 下一步

继续把工艺路线能力模型从单点热处理瓶颈扩展到多工序能力矩阵，覆盖设备能力、换型时间、外协 SLA、质量参数和排班窗口的综合约束。
