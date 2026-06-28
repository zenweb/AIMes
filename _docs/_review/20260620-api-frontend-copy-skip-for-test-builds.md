# Review: API 前端静态拷贝支持测试构建跳过

## 结论
- 通过。改动只增加显式 MSBuild opt-out，不改变默认 API build / publish 的前端静态文件复制行为。

## 风险检查
- 默认发布行为：`dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，且 target 条件仍要求 `Exists('../../frontend/.output/public')`。
- 后端测试稳定性：`/p:SkipFrontendBuildCopy=true` 下 `ExecutionEvidenceApi` 集成测试通过，后端测试可避开 `wwwroot/scheduling` 删除/复制。
- 架构防回退：新增架构测试要求 `SkipFrontendBuildCopy` 和默认行为保留条件。

## 剩余风险
- 本片没有修复 Docker API 不可达问题。
- 并行跑多个 dotnet 构建仍可能争用同一 `obj` 输出目录；验证命令应串行或使用隔离输出目录。
