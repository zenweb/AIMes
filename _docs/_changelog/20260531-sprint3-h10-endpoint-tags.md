# 2026-05-31 Sprint 3 H10 端点标签覆盖

## 变更

- H10：新增架构门 `H10AllMinimalApiEndpoints_ShouldDeclareTags`，扫描 `MES.Api/Endpoints/*.cs` 中所有 `group.MapGet/Post/Put/Patch/Delete` 端点，要求每条链路显式声明 `WithTags(...)`。
- H10：补齐漏标标签的端点：
  - `EquipmentEndpoints`：`PATCH /api/v1/equipment/{id}/status` 补 `WithTags("设备管理")`。
  - `SchedulingEndpoints`：`PATCH /api/v1/scheduling/workorders/{id}/status` 补 `WithTags("排产管理")`。

## 红灯证据

- 新增 H10 架构门初次执行失败：
  - `EquipmentEndpoints.cs: group.MapPatch("/{id}/status", UpdateStatusAsync) missing WithTags`
- 补 Equipment 后复跑继续失败：
  - `SchedulingEndpoints.cs: group.MapPatch("/workorders/{id}/status", UpdateWorkOrderStatusAsync) missing WithTags`
- 结论：端点标签覆盖存在少量遗漏，需要架构门防止回退。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~H10" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：18/18
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅保留既有 LF/CRLF 提示

## 备注

- 本轮只补缺失标签，不改变 authorization、validation、audit filter 顺序或 handler 行为。
