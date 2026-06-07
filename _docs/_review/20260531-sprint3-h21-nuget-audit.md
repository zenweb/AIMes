# 2026-05-31 Sprint 3 H21 Review

## 审查结论

- 全局 `NU1903` 抑制已移除，高危 NuGet 漏洞会重新阻断 restore/build。
- 移除抑制后暴露的 `Newtonsoft.Json 12.0.3` 高危漏洞已通过 central package override 升级到 `13.0.4`。
- 新增架构门覆盖 `Directory.Build.props`，防止后续把 `NU1903` 加回全局 `NoWarn`。

## 风险与边界

- `Newtonsoft.Json` 是为覆盖 `Microsoft.Azure.Devices` 传递依赖而显式引用在 Infrastructure；后续若升级 Azure IoT SDK 后不再需要，可清理该显式引用。
- 本轮未处理 `NU1510`，因为 H21 只点名 `NU1903`，且 `NU1510` 是 package restore 使用情况提示，不等同高危漏洞审计。

## 验证记录

- H21 定向架构门：红灯后 1/1 通过。
- 后端方案 restore：通过。
- `MES.Api` vulnerable package scan：无易受攻击的包。
- `MES.Infrastructure` vulnerable package scan：无易受攻击的包。
- 完整架构测试：23/23 通过。
- 后端 API build：0 warnings / 0 errors。
- `git diff --check`：通过，仅 LF/CRLF 提示。
