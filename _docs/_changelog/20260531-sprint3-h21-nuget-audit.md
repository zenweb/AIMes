# 2026-05-31 Sprint 3 H21 NuGet 审计抑制移除

## 变更

- H21：从 `Directory.Build.props` 移除 `NU1903` 抑制，让高危 NuGet 漏洞审计继续受 `TreatWarningsAsErrors=true` 阻断。
- H21：新增架构门 `H21DirectoryBuildProps_ShouldNotSuppressHighSeverityNuGetAuditWarnings`，防止 `NU1903` 被重新加入全局 `NoWarn`。
- H21：为 `MES.Infrastructure` 显式引用 `Newtonsoft.Json`，并在 central package management 中固定到 `13.0.4`，覆盖 `Microsoft.Azure.Devices` 传递引入的 `12.0.3` 高危版本。

## 红灯证据

- H21 架构门初次执行失败：
  - `Directory.Build.props` 仍包含 `NU1903`。
- 移除抑制后执行 `dotnet restore src/backend/AIMes.slnx` 失败：
  - `Newtonsoft.Json 12.0.3` 高危漏洞 `GHSA-5crp-9r3c-p9vr` 通过 `MES.Infrastructure` / `MES.Api` 暴露。
  - 根因：`Microsoft.Azure.Devices 1.22.0` / `Microsoft.Azure.Devices.Shared 1.20.1` 传递依赖 `Newtonsoft.Json 12.0.3`。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter H21DirectoryBuildProps_ShouldNotSuppressHighSeverityNuGetAuditWarnings`
  - 红灯确认后修复通过：1/1
- `dotnet restore src/backend/AIMes.slnx`
  - 修复后通过。
- `dotnet list src/backend/MES.Api/MES.Api.csproj package --vulnerable --include-transitive --no-restore --verbosity quiet`
  - 无易受攻击的包。
- `dotnet list src/backend/MES.Infrastructure/MES.Infrastructure.csproj package --vulnerable --include-transitive --no-restore --verbosity quiet`
  - 无易受攻击的包。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：23/23
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `git diff --check` 本轮触碰文件
  - 通过；仅 LF/CRLF 提示

## 备注

- 本轮只移除计划点名的 `NU1903`，保留既有 `NU1510` 抑制不变，避免扩大范围。
- 未升级 `Microsoft.Azure.Devices` 主依赖链，先用显式安全版 `Newtonsoft.Json` 覆盖传递漏洞。
