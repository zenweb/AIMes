# 2026-05-20 P2 — 质量返工回写排产与 OTD

## 触发

深化计划中 P2 “质量事件闭环”要求质量异常能追溯到工序和设备，并且返工会产生新的排产影响。当前质量页已有检验、异常和根因分析，但缺少进入排产与 OTD 复盘的闭环动作。

## 产出

- 新增 `src/frontend/src/components/quality/QualityReworkImpactPanel.vue`
- 新增 `src/frontend/src/utils/quality-rework-sync.ts`
- 新增 `src/frontend/tests/e2e/quality.spec.ts`
- 更新 `src/frontend/src/components/quality/QualityBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`
- 补充质量返工事件的设备、物料批次、批次号和证据链字段
- 稳定 `chat.spec.ts` 和 `equipment.spec.ts` 的 e2e 初始化时序

## 功能

- 质量页新增“返工影响排产与 OTD”面板。
- `INS-003 / WO-003 / 热处理` 返工事件展示不良数量、预计返工工时、OTD 风险和根因证据。
- 点击“生成返工排产事件”后，质量页会写入共享闭环记录。
- 排产页事件队列读取共享记录并新增“质量返工事件”。
- 质量返工事件可生成 Agent 建议：插入返工与复验窗口、合并同工艺批次、保护承诺交期。
- 报表中心 OTD 改善复盘读取同一记录，展示返工窗口、延期风险和恢复动作。
- 质量返工事件新增设备、物料批次、批次号和证据链，方便在排产与报表中追踪来源。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/quality.spec.ts --reporter=list --workers=1 --retries=0`，1 passed。
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/equipment.spec.ts --reporter=list --workers=1 --retries=0`，16 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，85 passed。
- 非阻断警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900k。

## 附带修复

- 稳定 `Equipment 设备管理 › 设备卡片渲染` e2e：先等待首张 `.eq-card` 可见再计数，避免异步加载瞬间读到 0 导致 flaky。
- 稳定 `Equipment 设备管理 › 类型筛选下拉框` e2e：把 localStorage 清理放回 `addInitScript` 阶段，避免 `page.evaluate` 在导航后抢占超时。
- 稳定 `AI 生产助手 (ChatPanel)` e2e：移除无意义的 `goto('./')`，避免初始化阶段重复导航。

## 下一步

继续 P1/P3 深化：让人员技能、班组排班和资质有效期进入开工校验与排产约束。
