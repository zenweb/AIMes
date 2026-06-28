# Todo: API 前端静态拷贝测试构建跳过后续

## 已完成
- [x] `CopyFrontendBuild` 支持 `/p:SkipFrontendBuildCopy=true`。
- [x] `PublishFrontendBuild` 支持 `/p:SkipFrontendBuildCopy=true`。
- [x] 新增架构测试防止开关回退。
- [x] 验证默认 API build 不受影响。
- [x] 验证带 skip 的执行证据集成测试通过。

## 后续建议
- [ ] 将后端测试脚本/CI 中不需要前端静态文件的测试命令统一加 `/p:SkipFrontendBuildCopy=true`。
- [ ] 避免并行执行共享同一 `MES.Api/obj` 输出目录的 dotnet build/test；如需并行，使用隔离输出目录。
- [ ] Docker API 恢复后，继续补容器级 PostgreSQL readback。
