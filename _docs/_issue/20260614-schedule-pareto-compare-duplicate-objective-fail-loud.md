# 2026-06-14 Issue - 多目标对比目标标识重复

## 问题
- `ParetoCompare.vue` 已检查目标身份是否缺失，但不检查多个方案是否复用同一个 `objective` key。
- 当后端返回两个方案都使用 `objective: 'balanced'` 时，页面会把两个方案都纳入对比和推荐渲染。
- 这会让目标 tab、active/best 状态、甘特图数据缓存和采用目标出现歧义。

## 影响
- 用户关键路径：排产看板的多目标方案对比、推荐方案查看和方案采用。
- 风险类型：重复 active/best 行、重复目标 tab、`ganttDataByObjective` 覆盖、采用方案身份不可信。
- 严重性：中高，属于现有排产功能必须补齐的正确性和可审计性缺口。

## 修复
- 增加目标标识唯一性校验。
- 使用 `Set` 比较 `items.map(item => item.objective)` 与原始数组长度，保持实现简单且可解释。
- 命中时抛出 `后端对比方案目标标识重复`。
- catch 分支沿用现有 fail-loud 告警，清空对比项、推荐目标和当前 tab。
- 单测和 Chromium e2e 均断言不展示推荐卡或“采用此方案”按钮。

## 验证
- 单测覆盖“两个对比方案复用同一个 objective key”必须 fail-loud。
- Chromium 真实浏览器覆盖该缺陷载荷后展示失败告警。
- 完整 ParetoCompare 单测、完整排产 Chromium 套件、前端覆盖率总检均已执行。
- 完整排产 Chromium 套件中出现 1 个既有 flaky，退出码为 0；该 flaky 已窄跑复测通过。
