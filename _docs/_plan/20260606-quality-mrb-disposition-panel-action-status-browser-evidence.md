# 2026-06-06 QualityMrbDispositionPanel MRB 动作语义 Plan

## 成功标准

- MRB 生成按钮在单测和真实 Chromium 中可通过包含 WO/INS 的可访问名称定位。
- MRB 闭环按钮在单测和真实 Chromium 中可通过包含 WO 的可访问名称定位。
- MRB 同步消息在单测和真实 Chromium 中暴露为 polite status。
- 不修改 MRB 业务逻辑。

## 执行

1. 读取 MRB 面板、质量 e2e、现有质量单测和 MRB sync 类型。
2. 新增 RED 组件单测证明按钮上下文名和同步 status 缺失。
3. 最小修改面板 DOM 语义。
4. 升级 MRB e2e 为真实角色定位证据。
5. 更新报告、changelog、review、todo、issue、plan。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- B 轨道发布闸门未纳入本片完成标准。
