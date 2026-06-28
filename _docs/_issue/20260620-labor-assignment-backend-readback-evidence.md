# Issue: 人员替班/资质阻断 Docker Live Readback 未闭合

## 现象
- `docker ps` 在当前 shell 返回 Docker API 不可达。
- 无法用容器内 PostgreSQL/API 对 `/api/v1/scheduling/labor-reassignments` 和 `/api/v1/scheduling/labor-qualification-blocks` 做 live readback。

## 已有替代证据
- `ScheduleAgentServiceTests.UpsertLabor*`：2 passed，证明服务层写 EvidenceLink/AuditLog。
- `SchedulingControllerTests.ExecutionEvidenceApi`：1 passed，证明 API 层执行证据 upsert/query 和审计落库。

## 额外构建问题
- 常规集成测试 build 触发 `CopyFrontendBuild`，删除 `wwwroot/scheduling/_nuxt/builds/meta` 被拒绝。
- `--no-build` 可运行已编译集成测试并通过。

## 需要后续处理
- 恢复当前 shell 对 Docker Desktop Linux Engine 的访问。
- 或给测试构建提供跳过前端拷贝 target 的显式 MSBuild 属性，避免 API 测试被前端静态文件占用影响。
