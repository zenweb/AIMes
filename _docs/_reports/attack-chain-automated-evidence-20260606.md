# Attack Chain automated support evidence

- GeneratedAt: 2026-06-06T18:49:56.0847794+08:00
- Scope: automated support evidence for manual Attack Chain A/B/C verification
- Manual gate boundary: this report does not replace verifier, VerifiedAt, or human evidence in run-attack-chain-verification.ps1.

## Mapping

- Attack Chain A: anonymous/low-privilege access and role matrix.
- Attack Chain B: credential/token/audit payload leakage controls.
- Attack Chain C: release security configuration and vulnerable package promotion controls.

## Attack Chain A - endpoint authorization

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Integration -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     5，已跳过:     0，总计:     5，持续时间: 11 s - MES.Tests.Integration.dll (net10.0)
```

Exit code: 0

## Attack Chain A - agent role matrix

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Unit -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Unit\bin\Debug\net10.0\MES.Tests.Unit.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:    37，已跳过:     0，总计:    37，持续时间: 72 ms - MES.Tests.Unit.dll (net10.0)
```

Exit code: 0

## Attack Chain B - credential and token leakage controls

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.Tests.Integration -> C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll
C:\AIWorks\AIMes\v1\src\tests\MES.Tests.Integration\bin\Debug\net10.0\MES.Tests.Integration.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     3，已跳过:     0，总计:     3，持续时间: 9 s - MES.Tests.Integration.dll (net10.0)
```

Exit code: 0

## Attack Chain C - release security configuration gates

```text
  MES.Domain -> C:\AIWorks\AIMes\v1\src\backend\MES.Domain\bin\Debug\net10.0\MES.Domain.dll
  MES.AI -> C:\AIWorks\AIMes\v1\src\backend\MES.AI\bin\Debug\net10.0\MES.AI.dll
  MES.Application -> C:\AIWorks\AIMes\v1\src\backend\MES.Application\bin\Debug\net10.0\MES.Application.dll
  MES.Infrastructure -> C:\AIWorks\AIMes\v1\src\backend\MES.Infrastructure\bin\Debug\net10.0\MES.Infrastructure.dll
  MES.Api -> C:\AIWorks\AIMes\v1\src\backend\MES.Api\bin\Debug\net10.0\MES.Api.dll
  MES.ArchitectureTests -> C:\AIWorks\AIMes\v1\src\tests\MES.ArchitectureTests\bin\Debug\net10.0\MES.ArchitectureTests.dll
C:\AIWorks\AIMes\v1\src\tests\MES.ArchitectureTests\bin\Debug\net10.0\MES.ArchitectureTests.dll (.NETCoreApp,Version=v10.0)的测试运行
总共 1 个测试文件与指定模式相匹配。

已通过! - 失败:     0，通过:     4，已跳过:     0，总计:     4，持续时间: 229 ms - MES.ArchitectureTests.dll (net10.0)
```

Exit code: 0

Result: PASS

- FinishedAt: 2026-06-06T18:50:43.5708543+08:00
