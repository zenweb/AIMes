# 2026-05-31 Sprint 3 H21 Issue

## 已处理

- 问题：`Directory.Build.props` 全局 suppress `NU1903`，导致高危 NuGet 漏洞审计无法阻断构建。
  - 处理：移除 `NU1903`，新增架构门防回流。
- 问题：移除 suppress 后暴露 `Newtonsoft.Json 12.0.3` 高危漏洞。
  - 处理：在 CPM 中固定 `Newtonsoft.Json 13.0.4`，并由 `MES.Infrastructure` 显式引用以覆盖 Azure IoT SDK 的传递旧版本。

## 待跟踪

- 后续可评估升级 `Microsoft.Azure.Devices`，若新版不再传递旧 `Newtonsoft.Json`，可删除显式 override。
