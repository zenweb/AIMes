# Admin 质量灰度前置校验重开 fail-loud 下一步

日期：2026-06-06

## 下一步

- 重新按覆盖率杠杆选片，优先低覆盖且用户必经的组件。
- 不再重复打磨已证明的 Admin 质量灰度写入失败路径：
  - `handleGrayReleaseDecision`
  - `approveGrayReleaseExpansion`
  - `closeGrayReviewIssueWithNegativeSample`
  - `reopenGrayPrevalidationWithScopeAdjustment`
- 下一片建议先跑 `npm.cmd run test:unit:coverage` 读取当前最低覆盖用户关键组件，再选择一个真实失败路径。
- 每次只切一个用户可触发失败路径，先 RED 再 GREEN，再跑真实 Chromium。

## B 轨仍需单独追踪

- Hosted CI run URL/run id/job summary。
- PostgreSQL/staging 演练证据。
- Attack Chain A/B/C 人工验证人与 `VerifiedAt`。
- 授权安全签字。
- 首次灰度和 14 天 P0/P1=0 观察结果。
