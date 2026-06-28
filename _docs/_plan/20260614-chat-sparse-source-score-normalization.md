# 2026-06-14 Plan: ChatPanel 稀疏来源分数归一化

## 成功标准
- 后端返回稀疏知识来源时，真实浏览器参考来源区不显示 `NaN%`。
- 单元测试和 Chromium e2e 都能证明该路径。
- 不扩展新功能，不触碰无关模块。

## 执行步骤
1. 写 RED 单测复现 `NaN%`。
2. 写 RED Chromium e2e 复现真实浏览器问题。
3. 在 ChatPanel 渲染前做最小归一化。
4. 跑 focused、完整相关测试和全量 unit coverage。
5. 补齐 changelog / review / todo / issue / plan 文档。

## 决策
- 当前跳过 15 天灰度观察，按负责人指令继续推进后续精品化工作。
