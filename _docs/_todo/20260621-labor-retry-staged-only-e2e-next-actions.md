# Next Actions: schedule-labor-evidence-retry

- 保持当前 staged 切片边界，不要对 `src/frontend/tests/e2e/scheduling.spec.ts` 执行整文件 `git add`。
- 已完成更宽验证：
  - `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/skill-matrix-panel.test.ts`
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"`
- 下一步可继续跑全量 `tests/e2e/scheduling.spec.ts`，但需预期它会覆盖多个未切分主题，若失败要按主题拆分审计。
- 如要进入 PR/提交，先复跑：
  - `git diff --cached --check`
  - `scripts/write-release-candidate-slice-hunk-map.ps1 -DiffMode staged`
  - `scripts/test-release-candidate-slice-boundary.ps1 -DiffMode staged`
- 本轮最终复跑已完成并通过；若 staged diff 再变化，以上三项必须重新跑。
- 保持 release-candidate manifest 与 staged code/script 文件一一对应；边界守卫现在会在缺失 manifest 文件时 FAIL。
- 全量 `tests/e2e/scheduling.spec.ts` 目前不能作为绿色证据；旧 Agent 工作台后端 API 两条用例需按 `_docs/_issue/20260621-scheduling-agent-e2e-offline-entry-regression.md` 单独切片。
- 后续切片继续按“精品现有功能”原则推进排产人员证据链，不扩新范围。
- 已将不完整 Agent E2E regression 文档从 staged 移出；Agent 代码与文档后续必须作为独立切片一起封。
- Agent 文档移出后已复跑 staged boundary：`_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-after-agent-doc-unstage.md` PASS。
