# Next Actions: EquipmentScheduleImpactPanel 异常分流维护复核单失败

日期：2026-06-06

## A 轨道

- [ ] 复跑 coverage summary，按当前低覆盖且用户必经路径选择下一片。
- [ ] 评估是否将 `tests/e2e/**/*.ts` 纳入 ESLint 配置，补齐 e2e 静态检查证据。
- [ ] 如继续设备路径，补后端持久化失败的 fail-loud 边界证据。

## B 轨道

- [ ] 补 hosted CI 的发布级 GitHub run URL / run id / job summary 归档。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。

