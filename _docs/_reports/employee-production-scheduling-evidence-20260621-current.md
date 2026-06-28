# Employee -> Production -> Scheduling evidence chain

- GeneratedAt: 2026-06-21T13:53:46.3004599+08:00
- Scope: focused backend evidence for operation-code ordering, production scan handoff, and scheduling context readback.
- Boundary: this is not the full integration suite; it is a bounded Sprint 0 evidence-chain smoke script.

## Reset dotnet build servers

```text
正在关闭 MSBuild 服务器...
正在关闭 VB/C# 编译器服务器...
成功关闭 VB/C# 编译器服务器。
成功关闭 MSBuild 服务器。
```

Exit code: 0

## OperationCode numeric sequence value object

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Unit -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     4，已跳过:     0，总计:     4，持续时间: 32 ms - MES.Tests.Unit.dll (net10.0)
```

Exit code: 0

## Production operation service handoff ordering

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Unit -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     6，已跳过:     0，总计:     6，持续时间: 402 ms - MES.Tests.Unit.dll (net10.0)
```

Exit code: 0

## Operation repository numeric ordering

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Integration -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     2，已跳过:     0，总计:     2，持续时间: 4 s - MES.Tests.Integration.dll (net10.0)
```

Exit code: 0

## Scheduling context WIP ordering

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Integration -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     1，已跳过:     0，总计:     1，持续时间: 5 s - MES.Tests.Integration.dll (net10.0)
```

Exit code: 0

## Production controller scan next-operation readback

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Integration -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     6，已跳过:     0，总计:     6，持续时间: 3 s - MES.Tests.Integration.dll (net10.0)
```

Exit code: 0

Result: PASS

- FinishedAt: 2026-06-21T13:54:32.0313153+08:00
