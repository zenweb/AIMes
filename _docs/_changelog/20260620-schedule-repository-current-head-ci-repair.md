# 2026-06-20 Schedule Repository Current Head CI Repair

## Changed
- 补齐 `IScheduleRepository.GetByIdForUpdateAsync` 合约和 `ScheduleRepository` 实现，满足当前 integration test 对排产重排持久化写路径的编译要求。
- `GetLatestFeedbackAsync` 继续过滤空 `ReasonDetail`，避免采用无解释详情的反馈记录。

## Evidence
- GitHub Agent Evaluation run `27845824668` 已证明前一轮 RabbitMQ 编译错误消失，并暴露新的 `ScheduleRepository.GetByIdForUpdateAsync` 缺口。
- `dotnet build src/backend/AIMes.slnx --no-restore /p:SkipFrontendBuildCopy=true --nologo --verbosity quiet --property:WarningLevel=0 --consoleloggerparameters:ErrorsOnly`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release --filter "FullyQualifiedName~ScheduleRepositoryTests" /p:SkipFrontendBuildCopy=true`
