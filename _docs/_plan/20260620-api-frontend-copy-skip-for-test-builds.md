# Plan: API 前端静态拷贝支持测试构建跳过

## 成功标准
- 后端测试构建可以显式跳过前端静态文件删除/复制。
- 默认 API 构建仍保留前端静态文件复制能力。
- 有架构测试防止 skip 开关被删除。

## 执行
1. 复跑 `ExecutionEvidenceApi` 集成测试，确认当前风险点。
2. 加架构红灯测试，要求 `SkipFrontendBuildCopy`。
3. 在 `MES.Api.csproj` 的 `CopyFrontendBuild` / `PublishFrontendBuild` 条件中加入 opt-out。
4. 串行跑架构测试、带 skip 的集成测试、默认 API build、不带 skip 的集成测试和 diff check。

## 状态
- 已完成。
