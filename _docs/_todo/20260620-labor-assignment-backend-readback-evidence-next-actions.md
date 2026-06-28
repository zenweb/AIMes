# Todo: 人员替班/资质阻断后端 Readback 后续

## 已完成
- [x] 确认后端映射人员替班/资质阻断 GET/POST 端点。
- [x] 确认服务层查询和 upsert 使用 `LaborReassignment` / `LaborQualificationBlock` EvidenceType。
- [x] 跑通服务层 upsert/audit 单元测试。
- [x] 跑通执行证据 API 集成测试。

## 待办
- [ ] 修复当前 shell 的 Docker API 访问后，补真实容器 `/api/v1/scheduling/labor-reassignments` 与 `/api/v1/scheduling/labor-qualification-blocks` readback。
- [ ] 评估 `MES.Api.csproj` 是否需要 `SkipFrontendBuildCopy` 之类的测试构建开关，避免 `CopyFrontendBuild` 阻塞后端测试。
- [ ] 若补开关，必须先加红灯构建/测试证据，再做最小实现。
