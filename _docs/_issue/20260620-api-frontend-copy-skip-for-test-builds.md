# Issue: 后端测试构建会被前端静态文件拷贝 Target 影响

## 现象
- 常规集成测试 build 曾触发 `MES.Api.csproj` 的 `CopyFrontendBuild`。
- 删除 `wwwroot/scheduling/_nuxt/builds/meta` 时出现权限/占用失败。
- 这会降低 Sprint 0 基线测试的可信度，因为后端测试可能被前端静态文件锁影响。

## 根因
- `CopyFrontendBuild` 和 `PublishFrontendBuild` 只有前端输出存在条件，没有后端测试构建 opt-out。

## 修复
- 增加 `SkipFrontendBuildCopy` MSBuild 属性。
- 默认行为不变；显式 `/p:SkipFrontendBuildCopy=true` 时跳过前端静态文件处理。
- 新增架构测试固化约束。

## 证据
- 红灯架构测试先失败。
- 修复后架构测试、带 skip 的集成测试、默认 API build、不带 skip 的集成测试均通过。
