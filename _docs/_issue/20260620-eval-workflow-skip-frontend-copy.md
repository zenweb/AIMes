# Issue: Agent Evaluation 工作流未使用 SkipFrontendBuildCopy

## 现象
- 主 CI 后端测试入口已加 `/p:SkipFrontendBuildCopy=true`，但 `eval.yml` 的 build/unit/evaluation test 仍未加。
- Agent Evaluation 远端证据仍可能被前端静态文件拷贝 target 影响。

## 根因
- 初次修复只覆盖主 CI 和安全/攻击链脚本，遗漏了独立的 `eval.yml`。

## 修复
- `eval.yml` 的 build/unit/evaluation test 命令全部增加 `/p:SkipFrontendBuildCopy=true`。
- 架构测试新增 eval 工作流 token 约束。

## 证据
- 红灯架构测试先失败。
- 修复后架构测试和 Evaluation 测试通过。
