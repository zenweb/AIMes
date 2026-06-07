# 2026-06-05 EngineeringConstraintPanel Fail-loud Issues

## Fixed

- 问题：`EngineeringConstraintPanel.vue` 的“同步工程证据”在 OTD 证据写入失败时会抛出未处理异常，没有明确告知用户同步失败。
- 风险：用户可能误判 BOM、工艺路线、质量门和技能资质约束已经进入 OTD 复盘证据链，后续报表中心或审计回放核对会缺证据。
- 处理：捕获同步写入异常，保留当前工程约束解释，并用 assertive alert 展示“工程约束证据同步失败”和失败原因。
- 验证：目标 unit `1 file / 1 test passed`，全量前端 unit coverage `82 files / 443 tests passed`，lint 通过。

## Remaining

- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- 当前仓库 remote 仍指向腾讯工蜂；`gh` 已登录不等于 Hosted CI 已有真实证据。
