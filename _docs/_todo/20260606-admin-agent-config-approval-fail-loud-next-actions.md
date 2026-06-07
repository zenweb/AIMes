# Admin Agent 配置审批 fail-loud 下一步

日期：2026-06-06

## 下一步

- 继续按覆盖率杠杆选片。
- `AdminBoard` 后续可优先审查质量灰度动作：
  - `handleGrayReleaseDecision`
  - `approveGrayReleaseExpansion`
  - `closeGrayReviewIssueWithNegativeSample`
  - `reopenGrayPrevalidationWithScopeAdjustment`
- 每次只切一个用户可触发失败路径，先 RED 再 GREEN，再跑真实 Chromium。

## B 轨仍需单独追踪

- Hosted CI run URL/run id/job summary。
- PostgreSQL/staging 演练证据。
- Attack Chain A/B/C 人工验证人与 `VerifiedAt`。
- 授权安全签字。
- 首次灰度和 14 天 P0/P1=0 观察结果。
