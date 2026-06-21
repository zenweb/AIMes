# 2026-06-21 schedule-labor-evidence-retry staged-only E2E

- 完成 `schedule-labor-evidence-retry` 候选切片重整：staged 差异限定在人员证据启动读取失败、重试恢复、人员约束释放链路。
- 新增排产启动人员证据 fail-loud 读取：后端人员资质阻断 / 替班证据读取失败时保留排产主数据，并在预警栏提供“重试人员证据 / Retry labor evidence”动作。
- 补齐 `executionEvidence.ts` 与 `labor-assignment-sync.ts` 的 `failLoud` 透传，避免人员证据读取失败被 API/backend-first fallback 静默吞掉。
- 修复 E2E mock 边界：目标测试自动切到 live backend mock，人员证据首读失败后重试返回释放证据；`/equipment` mock 不再误拦 `/equipment/bottlenecks`。

验证：

- `git diff --cached --check` PASS。
- `scripts/test-release-candidate-slice-boundary.ps1 -DiffMode staged` PASS。
- staged-only tree: `C:\AIWorks\_tmp\AIMes-v1-labor-retry-staged-verify-NEW3`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"` PASS，1 passed。
- 扩大验证：`npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/skill-matrix-panel.test.ts` PASS，3 files / 91 tests。
- 扩大验证：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"` PASS，3 passed。
- 刷新候选片边界证据：manifest 覆盖全部 5 个 staged code/script 文件；边界守卫新增缺失 manifest 文件 FAIL；hunk map 输出 `Diff Files Missing From Manifest: none`。
- 人工复核 5 个 `NEUTRAL_REVIEW` hunks，确认均为人员证据 retry/fail-loud 或测试隔离依赖，不是无关主题。
- 追加全量 scheduling E2E 探针：发现旧 Agent 工作台后端 API 用例仍有独立 offline/runtime fallback 问题，已记录 `_docs/_issue/20260621-scheduling-agent-e2e-offline-entry-regression.md`，不并入人员证据 retry 候选片完成声明。
- 最终重拆 staged 切片：从过宽 staging 中剥离 dhtmlx、Assistant、多目标对比等旧主题，仅保留人员证据 retry 所需的 API / utils / ScheduleBoard / E2E hunks。
- 最终边界证据：`_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-final.md` PASS；`_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-staged-final.md` 显示 17 个 KEEP_CANDIDATE、6 个 NEUTRAL_REVIEW、0 个 excluded theme。
- 最终验证：单测 3 files / 92 tests PASS；人员证据聚焦 E2E 3/3 PASS。
