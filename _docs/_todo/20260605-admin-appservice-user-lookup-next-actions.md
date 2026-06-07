# 2026-06-05 AdminAppService User Lookup Next Actions

## 已完成

- `AdminAppService.UpdateUserAsync()` 已改为仓储 `GetByIdAsync()` 直查。
- `IUserRepository` / `UserRepository` 已补 `GetByIdAsync()`。
- `AdminAppServiceTests` 已验证更新路径不再调用 `GetAllAsync()`。
- 后端 solution 已通过验证。

## 后续

- 若继续收口后台管理入口，优先审计其它仍存在全量读取的管理动作，再决定是否扩展仓储直查或分页。
