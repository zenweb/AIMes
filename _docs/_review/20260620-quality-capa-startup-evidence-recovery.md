# Review: 质量 CAPA 启动证据恢复与可选 latest 空状态

## 结论
- 修复点聚焦在质量闭环现有关键路径，没有扩展新功能。
- `QualityCapaTaskPanel` 不再因任一启动证据源失败而丢失整块 CAPA 处置界面。
- 可选 latest 404 被调用方处理为暂无记录，不再通过全局 toast 打扰用户。

## 风险与边界
- 404 仍然存在，代表当前后端暂无 MRB disposition / Risk SLA review latest 记录；本片没有伪造记录。
- `suppressErrorToast` 只抑制全局 toast，不吞掉 Promise rejection；fail-loud 调用仍可抛错。
- 本轮未做全量测试，只做了质量 CAPA、质量知识、HTTP、质量证据、风险证据与构建验证。
