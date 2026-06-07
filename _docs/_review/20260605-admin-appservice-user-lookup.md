# 2026-06-05 AdminAppService User Lookup Review

## 审计结论

- `AdminAppService.UpdateUserAsync()` 已不再全量加载所有系统用户。
- 更新路径现在走 `IUserRepository.GetByIdAsync()` 直查目标用户，再做资料/角色/启停修改并落库。
- 单测已锁定行为，防止回退到 `_userRepo.GetAllAsync()`。

## 验证

- `dotnet test .\\src\\tests\\MES.Tests.Unit\\MES.Tests.Unit.csproj --filter FullyQualifiedName~AdminAppServiceTests --no-restore`：通过。
- `dotnet test .\\src\\backend\\AIMes.slnx --no-restore`：通过，后端 Unit `434 passed`、Integration `175 passed`、Architecture `85 passed`、Evaluation `2 passed`。

## 结论

- APPROVE。
