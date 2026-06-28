# Issue: 后端测试入口未使用 SkipFrontendBuildCopy

## 现象
- `MES.Api.csproj` 已支持 `/p:SkipFrontendBuildCopy=true`，但 CI 和安全/攻击链脚本中的 `dotnet test` 命令未使用。
- 后端测试仍可能触发前端静态文件删除/复制，受到 `wwwroot/scheduling` 文件锁影响。

## 根因
- 只给 API 项目 target 增加了 opt-out，未把测试入口接上该属性。

## 修复
- CI 后端测试命令统一增加 `/p:SkipFrontendBuildCopy=true`。
- 安全自评和攻击链自动证据脚本的后端测试命令统一增加 `/p:SkipFrontendBuildCopy=true`。
- 新增架构测试约束这些入口。

## 证据
- 红灯架构测试先失败。
- 修复后架构测试通过，代表性 integration/unit 命令通过。
