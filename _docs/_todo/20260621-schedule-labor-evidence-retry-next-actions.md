# Todo - Schedule Labor Evidence Retry Next Actions

- 已用真实 Chromium 跑通 focused 人员证据重试路径；后续若改动排产启动链，保留该 focused 回归。
- 若真实后端仍无人员证据 seed，记录为后端数据完整性问题，不在前端静默吞掉。
- 继续按覆盖率杠杆优先处理 `ScheduleBoard.vue` 和 `ChatPanel.vue` 等低覆盖核心路径。
- 保持 release gate 为非严格完成，直到 dirty worktree 进入 hosted CI 且灰度观察有最终结论。
- 已修复 `人员替班证据释放排产人员约束` 和 `人员无有效替班候选时排产保持停工复核事件` 的人员证据/fixture 漂移；后续仍可抽出通用 live-mock E2E auth/session fixture，降低新增用例重复成本。
- 保留 `scripts/e2e.mjs` 中 `targetsLiveBackendMock` 与 `targetsRealDhtmlx` 的拆分，避免需要 live API mock 的用例误关闭 demo hints。
- 员工离线入口已验证 2/2 passed；若用户仍在旧 dev server 看到 `Offline demo mode skipped backend request`，优先重启前端服务或确认当前访问的是新构建。
- 下一步 release-candidate：按 `_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.md` 只 staging 该切片文件，做 staged diff review，再推送新 SHA 触发 hosted CI。
- 注意：当前候选代码文件 diff 仍偏大，尤其 `scheduling.spec.ts` 混有大量历史 E2E 改动；先拆小或 owner review 后再 staging/push。
- 优先拆分顺序：人员证据重试/offline fallback -> dhtmlx 拖拽写回 -> 多目标对比反馈读回 -> Assistant/工程约束 fail-loud -> 排产帮助链接。
