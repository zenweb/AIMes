# 2026-06-06 Issue：审计回放详情区缺少命名 region 语义

## 现象

- 用户点击“回放决策链”后，详情区只是普通 `.replay-detail` 容器。
- 详情标题没有被用作区域名称，选中回放链变化也没有 polite 播报语义。

## 影响

- 辅助技术用户无法稳定跳转到当前审计回放详情区域。
- 审计证据链是发布合规和安全签字的重要路径，该缺口降低了精品级可验证性。

## 处理

- 为 `.replay-detail` 增加 `role="region"`、`aria-live="polite"`、`aria-labelledby="audit-replay-detail-title"`。
- 为详情标题增加 `id="audit-replay-detail-title"`。
- 用 RED/GREEN 单测和真实 Chromium e2e 验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
