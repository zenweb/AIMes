# 2026-05-31 Sprint 5 M1/M2 DB Options Review

## 结论

- 本地审计通过：运行时数据库 provider 与默认连接串已纳入 `IOptions<DatabaseOptions>` + `ValidateOnStart()` 启动校验。
- JWT、CORS、DB 三个 M1/M2 配置子项均已有架构门禁覆盖。

## 覆盖点

- 缺少 `ConnectionStrings:DefaultConnection` 时，启动验证器抛出 `OptionsValidationException`。
- `Database:Provider` 为不支持值时，启动验证器抛出 `OptionsValidationException`。
- 合法 provider 与连接串可通过启动验证。
- `AddDatabaseServices` 不再通过 raw `IConfiguration` 手写数据库配置异常。

## 剩余风险

- `DatabaseOptions.BindFromConfiguration` 是配置绑定集中点，内部仍读取 `ConnectionStrings:DefaultConnection`；这是为了兼容 .NET 标准 connection string section。
- EF 设计时工厂仍直接读取配置，后续若要统一 CLI 体验，可单独设计，不应混入运行时启动校验。
