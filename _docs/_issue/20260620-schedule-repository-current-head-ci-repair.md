# 2026-06-20 Issue - Schedule Repository Current Head CI Repair

## Symptom
- Agent Evaluation run `27845824668` 在 build 阶段失败：
  - `ScheduleRepository` does not contain a definition for `GetByIdForUpdateAsync`。

## Root Cause
- Integration test 已要求 PostgreSQL 重排写路径使用 tracked read，但远端当前 head 的 `IScheduleRepository` / `ScheduleRepository` 尚未包含该方法。

## Fix
- 在接口和 EF 仓储实现中加入 `GetByIdForUpdateAsync`。
- 保持 `GetByIdAsync` no-tracking，用方法名显式区分读模型和写路径。

## Verification
- 本地 solution build 通过。
- `ScheduleRepositoryTests` 3 passed。
