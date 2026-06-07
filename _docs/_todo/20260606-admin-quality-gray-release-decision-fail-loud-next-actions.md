# Admin 质量灰度决策 fail-loud 下一步

日期：2026-06-06

## 下一步

- 继续按覆盖率杠杆选片，优先低覆盖且用户必经的 Agent 治理路径。
- `AdminBoard` 后续优先审查质量灰度复核动作：
  - `approveGrayReleaseExpansion`
  - `closeGrayReviewIssueWithNegativeSample`
  - `reopenGrayPrevalidationWithScopeAdjustment`
- 不再重复打磨已证明的 `handleApprovalDecision` 和本次 `handleGrayReleaseDecision` 写入失败路径，除非出现新的真实缺口。
- 每次只切一个用户可触发失败路径，先 RED 再 GREEN，再跑真实 Chromium。

## B 轨仍需单独追踪

- Hosted CI run URL/run id/job summary。
- PostgreSQL/staging 演练证据。
- Attack Chain A/B/C 人工验证人与 `VerifiedAt`。
- 授权安全签字。
- 首次灰度和 14 天 P0/P1=0 观察结果。
