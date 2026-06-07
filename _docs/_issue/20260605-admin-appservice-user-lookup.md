# 2026-06-05 AdminAppService User Lookup Issue

## 问题

- `AdminAppService.UpdateUserAsync()` 仍通过 `_userRepo.GetAllAsync()` 拉取全部系统用户，再在应用层按 `Id` 找目标用户。
- 这会让用户编辑/启停路径保留不必要的全量读取，和已经收口的分页/直查标准不一致。

## 处理目标

- 用户更新改为仓储按 `Id` 直查。
- 单测锁定：更新路径只允许调用 `GetByIdAsync()`，不允许再调用 `GetAllAsync()`。
- 通过后端 solution 测试确认无回归。
