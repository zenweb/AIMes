# 2026-06-06 AnomalyBoard 异常详情 Dialog Plan

## 成功标准

- 异常详情在单测中具备 `role="dialog"`、`aria-modal="true"` 和标题关联。
- 关闭按钮在单测和真实 Chromium 中具备 `关闭异常详情` 可访问名称。
- 真实 Chromium 场景能通过命名 dialog 打开详情，并继续执行 AI 分析建议。
- 不修改异常管理业务逻辑。

## 执行

1. 短复核 B 轨 gh、remote、Docker engine 和 staging 镜像状态。
2. 读取 AnomalyBoard、现有单测和 anomaly e2e。
3. 新增 RED 单测证明详情抽屉缺少 dialog 语义。
4. 最小修改详情抽屉 DOM 语义。
5. 升级 anomaly e2e 为真实角色定位证据。
6. 更新报告、changelog、review、todo、issue、plan。

## 结果

- B 轨仍缺外部证据，未关闭。
- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
