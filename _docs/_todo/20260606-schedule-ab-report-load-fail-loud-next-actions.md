# Next Actions: ScheduleBoard A/B 报告读取

日期：2026-06-06

## A 轨道

- [ ] 继续按覆盖率杠杆选择下一个低覆盖且用户必经组件。
- [ ] ScheduleBoard 下一步优先审查启动期读取路径：工程变更审批、路线能力校验、工程约束包读取。
- [ ] 只为真实用户可感知的失败补 fail-loud，不为已有诚实 fallback 的工具路径造假失败。

## B 轨道

- [ ] 补 hosted CI 的 GitHub run URL / run id / job summary。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。
