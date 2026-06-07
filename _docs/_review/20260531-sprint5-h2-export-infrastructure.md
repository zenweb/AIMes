# 2026-05-31 Sprint 5 H2 Export Infrastructure Review

## 结论

- 本地审计通过：导出渲染依赖已从 Application 边界移出，具体渲染实现位于 Infrastructure。
- API 依赖注入现在显式绑定 `IExportAppService` 到 `MES.Infrastructure.Services.ExportAppService`，降低同名类型导致的架构回退风险。

## 覆盖点

- `MES.Application.csproj` 不包含 `ClosedXML` / `QuestPDF`。
- `MES.Infrastructure.csproj` 包含 `ClosedXML` / `QuestPDF`。
- Application 层 `ExportAppService.cs` 仅声明 `IExportAppService`。
- Infrastructure 层 `ExportAppService` 引用 ClosedXML/QuestPDF 并实现接口。
- 架构测试覆盖 DI 注册的具体实现类型。

## 剩余风险

- 当前仅验证导出服务的层边界和编译，不覆盖 Excel/PDF 文件内容的像素级或格式级验收。
- 若后续新增其它导出格式，需要继续保持渲染库只在 Infrastructure 或更外层适配器中出现。
