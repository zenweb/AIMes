# Review: schedule-labor-evidence-retry staged-only E2E

## 结论

- 本候选切片当前 staged-only 验证通过。
- 边界报告通过，未再混入真实 dhtmlx、Assistant 交接、多目标反馈等无关主题。
- 本轮发现并修正两个真实缺口：仅改 `ScheduleBoard.vue` 不足以 fail loud，API 层和 backend-first utils 层也必须透传 `failLoud`。
- 扩大验证已覆盖人员证据 utils、排产组件、人员替班面板，以及 3 条人员证据相关浏览器场景。

## 审计点

- `src/frontend/src/components/schedule/ScheduleBoard.vue`
  - 启动时并行读取人员资质阻断与替班证据。
  - 失败时只追加人员证据预警，不阻断正式排产主数据。
  - 重试成功后重新应用替班/资质阻断闭环并刷新风险事件。

- `src/frontend/src/api/executionEvidence.ts`
  - `queryLaborReassignments` 与 `queryLaborQualificationBlocks` 支持 `failLoud`。
  - 非 fail-loud 调用仍保持旧 fallback 行为，降低现有调用面风险。

- `src/frontend/src/utils/labor-assignment-sync.ts`
  - backend-first 读取支持 `failLoud` 重抛。
  - 远端与本地证据按 id 去重、按 createdAt 倒序合并，避免后端恢复后丢掉本地证据。

- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 覆盖首读失败、预警展示、重试、证据释放、事件闭环、Gantt 主数据继续可见。

## 剩余风险

- 当前验证覆盖目标 E2E 与相邻人员证据 E2E；未重跑全量 scheduling E2E。
- 工作区仍有大量无关改动，后续继续候选切片时必须保持 staged 边界检查。

## 追加验证

- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/skill-matrix-panel.test.ts`
  - PASS，3 files / 91 tests。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"`
  - PASS，3 passed。

## 边界刷新复核

- release-candidate manifest 已覆盖本切片全部 5 个 staged code/script 文件：`e2e.mjs`、`executionEvidence.ts`、`ScheduleBoard.vue`、`labor-assignment-sync.ts`、`scheduling.spec.ts`。
- 边界守卫新增“diff code/script 文件缺失 manifest”检查；以后 staged diff 里只要出现未声明的 code/script 文件会直接 FAIL。
- hunk map 新增 `Diff Files Missing From Manifest` 输出；当前报告为 none。
- 5 个 `NEUTRAL_REVIEW` hunks 已人工复核：`ScheduleBoard.vue` 的状态/预警聚合 hunk 是 retry/fail-loud 依赖；`scheduling.spec.ts` 的设备路由收窄与 offline demo 入口 hunk 是测试隔离依赖，避免宽 mock 吞掉人员重试路由。

## 最终 staged 复核

- `git diff --cached --check` PASS。
- `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-final.md`：PASS，excluded theme token hits 为 none。
- `_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-staged-final.md`：17 个 KEEP_CANDIDATE、6 个 NEUTRAL_REVIEW、0 个 EXCLUDE/MIXED。
- 最终聚焦验证：`labor-assignment-sync.test.ts`、`schedule-board.test.ts`、`skill-matrix-panel.test.ts` 合计 92 tests PASS；`scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"` 3/3 PASS。

## Agent 文档移出后复核

- 曾短暂 staged Agent E2E regression 文档，但 Agent 代码 hunk 仍处于 unstaged，直接保留会让候选片出现“文档已修、代码未入片”的审计矛盾。
- 已将 Agent E2E regression 五类文档移回 unstaged，保留工作区文件，后续作为独立切片处理。
- 重新运行 staged 边界守卫：`_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-after-agent-doc-unstage.md`：PASS。
- 当前 staged 候选片重新回到 `schedule-labor-evidence-retry` 边界。

## Staged code review follow-up

- 审计发现 staged `ScheduleBoard.vue` 中人员证据重试按钮和预警文案存在 mojibake 乱码。
- 已仅修正 staged 版本中的人员证据相关中文文案，不引入工作区其它排产改动。
- 复核：`git diff --cached -- src/frontend/src/components/schedule/ScheduleBoard.vue | rg "姝|浜哄|绾︽|锛|鏈|閲嶈"` 无命中；`git diff --cached --check` PASS。
- 追加复核人员证据重试核心路径：首读失败走本地 fallback 且保留主排产数据；重试成功后 released block 不再生成阻断事件，approved reassignment 进入人员替班闭环事件；未发现新的 merge blocker。

## Staged-only clean worktree verification

- 已从当前 index 导出 staged patch，并应用到 detached `HEAD 47d65547557a8a6cf035327ae94455a1a1285daf` 的临时 clean worktree：`tmp/labor-retry-staged-worktree`。
- 该环境不包含当前主工作区的 unstaged 改动，用来证明候选片本身可复现。
- Clean worktree 单测：`npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/skill-matrix-panel.test.ts --maxWorkers=1 --no-file-parallelism`，29 tests PASS。
- Clean worktree E2E：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"`，3/3 PASS。
