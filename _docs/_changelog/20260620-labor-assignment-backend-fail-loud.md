# 2026-06-20 人员替班/资质阻断后端审计 Fail Loud

## 变更
- `queryLaborReassignments(take, { failLoud })` 与 `queryLaborQualificationBlocks(take, { failLoud })` 支持审计刷新路径在后端失败时抛错。
- `readLaborReassignmentsBackendFirst({ failLoud })` 与 `readLaborQualificationBlocksBackendFirst({ failLoud })` 支持审计刷新路径 fail loud。
- 后端返回非数组载荷时给出明确错误：
  - `后端返回非数组人员替班审计载荷`
  - `后端返回非数组人员资质阻断审计载荷`
- 默认路径仍保留本地 fallback，并继续过滤残缺后端记录，避免人员资质风险和替班责任人证据被残缺载荷污染。

## 验证
- RED：
  - `npm run test:unit -- tests/unit/execution-evidence-api.test.ts` 先失败，`failLoud` 仍返回 `[]`。
  - `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts` 先失败 3 条，后端失败未 reject，非数组错误为 `records.filter is not a function`。
- GREEN：
  - `npm run test:unit -- tests/unit/execution-evidence-api.test.ts`：3 passed。
  - `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts`：10 passed。
- 关联回归：
  - `npm run test:unit -- tests/unit/skill-matrix-panel.test.ts`：5 passed。
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "labor|人员|资质|替班|qualification|reassignment"`：2 passed / 67 skipped。
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "labor|人员|资质|替班|qualification|reassignment"`：2 passed / 37 skipped。
  - `npm run test:unit -- tests/unit/chat-panel.test.ts -t "labor|人员|资质|替班|qualification|reassignment"`：1 passed / 70 skipped。
  - `npm run test:unit -- tests/unit/report-board.test.ts -t "labor|人员|资质|替班|qualification|reassignment"`：0 matched，28 skipped。
- Lint：`npm run lint -- src/api/executionEvidence.ts src/utils/labor-assignment-sync.ts tests/unit/labor-assignment-sync.test.ts tests/unit/execution-evidence-api.test.ts` 通过。
- Diff check：`git diff --check -- src/frontend/src/api/executionEvidence.ts src/frontend/src/utils/labor-assignment-sync.ts src/frontend/tests/unit/labor-assignment-sync.test.ts src/frontend/tests/unit/execution-evidence-api.test.ts` 仅 LF/CRLF 提示。

## 影响
- 人员管理/技能矩阵、排产与生产开工链路在普通运行中仍可用本地证据兜底。
- 审计刷新和发布证据采集可选择 fail loud，不再把人员替班/资质阻断后端不可用误判为“无证据”。
