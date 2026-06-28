# Plan: Agent Evaluation 工作流跳过前端静态拷贝

## 成功标准
- `eval.yml` build/test 命令全部显式传入 `/p:SkipFrontendBuildCopy=true`。
- 架构测试覆盖 eval 工作流。
- 代表性 Evaluation 测试命令可执行。

## 执行
1. 扩展 `BackendTestEntrypoints_ShouldSkipFrontendStaticCopy` 到 `eval.yml`。
2. 跑红灯架构测试。
3. 修改 `eval.yml` 三个命令。
4. 跑绿色架构测试、Evaluation 测试、静态搜索和 diff check。

## 状态
- 已完成。
