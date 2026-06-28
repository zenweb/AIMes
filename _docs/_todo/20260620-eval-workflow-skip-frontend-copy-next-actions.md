# Todo: Agent Evaluation 工作流跳过前端静态拷贝后续

## 已完成
- [x] `eval.yml` build 命令带 `/p:SkipFrontendBuildCopy=true`。
- [x] `eval.yml` Unit Tests 命令带 `/p:SkipFrontendBuildCopy=true`。
- [x] `eval.yml` Evaluation Tests 命令带 `/p:SkipFrontendBuildCopy=true`。
- [x] 架构测试覆盖 eval 工作流。
- [x] 代表性 Evaluation 测试通过。

## 后续建议
- [ ] 下一次远端 Agent Evaluation 运行后，确认 hosted workflow 对当前 HEAD 通过。
- [ ] 继续处理 Docker/PostgreSQL live readback 缺口。
