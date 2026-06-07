# Security self-assessment

- Started at: 2026-06-01T13:19:55.9129336+08:00
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

已通过! - 失败:     0，通过:    50，已跳过:     0，总计:    50，持续时间: 267 ms - MES.Tests.Unit.dll (net10.0)
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

已通过! - 失败:     0，通过:    18，已跳过:     0，总计:    18，持续时间: 36 s - MES.Tests.Integration.dll (net10.0)
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

已通过! - 失败:     0，通过:     9，已跳过:     0，总计:     9，持续时间: 169 ms - MES.ArchitectureTests.dll (net10.0)
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
# npm audit report

esbuild  <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
fix available via `npm audit fix --force`
Will install vite@8.0.15, which is a breaking change
node_modules/esbuild
  vite  <=6.4.1
  Depends on vulnerable versions of esbuild
  node_modules/vite
    vite-node  <=2.2.0-beta.2
    Depends on vulnerable versions of vite
    node_modules/vite-node
      vitest  0.0.1 - 0.0.12 || 0.0.29 - 0.0.122 || 0.3.3 - 2.2.0-beta.2
      Depends on vulnerable versions of vite
      Depends on vulnerable versions of vite-node
      node_modules/vitest
        @vitest/coverage-v8  <=2.2.0-beta.2
        Depends on vulnerable versions of vitest
        node_modules/@vitest/coverage-v8


5 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
```

Exit code: 0

Result: PASS

- Finished at: 2026-06-01T13:22:56.8393492+08:00
