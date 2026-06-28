# Plan: 后端测试入口统一跳过前端静态拷贝

## 成功标准
- CI 后端测试命令显式传入 `/p:SkipFrontendBuildCopy=true`。
- 安全自评和攻击链自动证据脚本中的后端测试命令显式传入 `/p:SkipFrontendBuildCopy=true`。
- 架构测试约束上述入口，防止回退。
- 代表性命令实际可跑。

## 执行
1. 搜索 CI 和脚本中的 `dotnet test` 入口。
2. 增加架构红灯测试。
3. 修改 CI 和脚本命令。
4. 跑架构测试、代表性 integration/unit 测试、静态搜索和 diff check。

## 状态
- 已完成本片。
