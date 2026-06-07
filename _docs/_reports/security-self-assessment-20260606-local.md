# Security self-assessment

- Started at: 2026-06-06T18:53:31.4971380+08:00
- Scope: v1.0.0 release gate security self-assessment
- Manual verification required: Attack Chain A/B/C and human signoff are not automated by this script.

## MES.Tests.Unit security tests

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Unit -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:    50，已跳过:     0，总计:    50，持续时间: 66 ms - MES.Tests.Unit.dll (net10.0)
```

Exit code: 0

## MES.Tests.Integration security tests

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Integration -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:    18，已跳过:     0，总计:    18，持续时间: 33 s - MES.Tests.Integration.dll (net10.0)
```

Exit code: 0

## MES.ArchitectureTests security gates

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.ArchitectureTests -> C:\AIWorks\AIMes\v1\src\tests\MES.ArchitectureTests\bin\Debug\net10.0\MES.ArchitectureTests.dll
C:\AIWorks\AIMes\v1\src\tests\MES.ArchitectureTests\bin\Debug\net10.0\MES.ArchitectureTests.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:    19，已跳过:     0，总计:    19，持续时间: 193 ms - MES.ArchitectureTests.dll (net10.0)
```

Exit code: 0

## NuGet vulnerability audit

```text
  正在确定要还原的项目…
  所有项目均是最新的，无法还原。

使用了以下源:
   https://api.nuget.org/v3/index.json
   C:\Program Files (x86)\Microsoft SDKs\NuGetPackages\

在给定当前源的情况下，给定项目“MES.AI”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Api”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Application”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Domain”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Infrastructure”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.ArchitectureTests”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Benchmarks”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Tests.Evaluation”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Tests.Integration”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Tests.Unit”没有易受攻击的包。
在给定当前源的情况下，给定项目“MES.Tools.AbBenchmark”没有易受攻击的包。
```

Exit code: 0

## npm audit

```text
npm config get registry: https://registry.npmmirror.com
found 0 vulnerabilities
```

Exit code: 0

Result: PASS

- Finished at: 2026-06-06T18:54:59.1250013+08:00
