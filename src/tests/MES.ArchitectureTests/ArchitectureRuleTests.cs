using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using FluentAssertions;
using MES.Application.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Primitives;
using MES.Infrastructure.Data;
using MES.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace MES.ArchitectureTests;

public sealed class ArchitectureRuleTests
{
    [Fact]
    public void Domain_ShouldNotReferenceMediatR()
    {
        var references = typeof(IDomainEvent).Assembly.GetReferencedAssemblies();

        references.Select(r => r.Name)
            .Where(name => name is not null && name.StartsWith("MediatR", StringComparison.Ordinal))
            .Should().BeEmpty();
    }

    [Fact]
    public void Application_ShouldNotReferenceExportRenderingLibraries()
    {
        var references = typeof(IExportAppService).Assembly.GetReferencedAssemblies();

        references.Select(r => r.Name).Should().NotContain(["ClosedXML", "QuestPDF"]);
    }

    [Fact]
    public void ExportRendering_ShouldLiveInInfrastructureAndBeRegisteredExplicitly()
    {
        var repositoryRoot = FindRepositoryRoot();
        var applicationProject = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Application/MES.Application.csproj"));
        var infrastructureProject = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/MES.Infrastructure.csproj"));
        var applicationExportSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Application/Services/ExportAppService.cs"));
        var infrastructureExportSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Services/ExportAppService.cs"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var violations = new List<string>();

        if (applicationProject.Contains("ClosedXML", StringComparison.Ordinal)
            || applicationProject.Contains("QuestPDF", StringComparison.Ordinal))
        {
            violations.Add("MES.Application.csproj must not reference export rendering packages.");
        }

        if (!infrastructureProject.Contains("<PackageReference Include=\"ClosedXML\"", StringComparison.Ordinal)
            || !infrastructureProject.Contains("<PackageReference Include=\"QuestPDF\"", StringComparison.Ordinal))
        {
            violations.Add("MES.Infrastructure.csproj must own ClosedXML and QuestPDF package references.");
        }

        if (!applicationExportSource.Contains("public interface IExportAppService", StringComparison.Ordinal)
            || applicationExportSource.Contains("class ExportAppService", StringComparison.Ordinal))
        {
            violations.Add("MES.Application must expose only the IExportAppService boundary.");
        }

        if (!infrastructureExportSource.Contains("public class ExportAppService : IExportAppService", StringComparison.Ordinal)
            || !infrastructureExportSource.Contains("using ClosedXML.Excel;", StringComparison.Ordinal)
            || !infrastructureExportSource.Contains("using QuestPDF.Fluent;", StringComparison.Ordinal))
        {
            violations.Add("MES.Infrastructure must contain the concrete export renderer implementation.");
        }

        if (!serviceCollectionSource.Contains("using InfrastructureExportAppService = MES.Infrastructure.Services.ExportAppService;", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains("AddScoped<IExportAppService, InfrastructureExportAppService>()", StringComparison.Ordinal))
        {
            violations.Add("DI must explicitly bind IExportAppService to MES.Infrastructure.Services.ExportAppService.");
        }

        violations.Should().BeEmpty("Sprint 5 H2 requires rendering dependencies to stay out of Application while API resolves the Infrastructure implementation");
    }

    [Fact]
    public void BackendReportPdf_ShouldRenderScheduleFeedbackEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var exportSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Services/ExportAppService.cs"));
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "if (report.ScheduleFeedback is not null)",
            "Text(\"排产采纳反馈\")",
            "Text(\"原因说明\")",
            "Text(report.ScheduleFeedback.ReasonDetail)",
            "Text(\"Trace ID\")",
            "Text(report.ScheduleFeedback.TraceId ?? string.Empty)",
            "Text(\"Agent Decision ID\")",
            "Text(report.ScheduleFeedback.AgentDecisionId ?? string.Empty)"
        })
        {
            if (!exportSource.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"ExportAppService PDF renderer missing schedule feedback evidence token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("backend PDF exports must carry the same auditable schedule feedback evidence as dashboard JSON and Excel exports");
    }

    [Fact]
    public void AppServices_ShouldNotHaveStaticMutableFields()
    {
        var violations = typeof(IExportAppService).Assembly.GetTypes()
            .Where(type => type is { IsClass: true, IsAbstract: false }
                && type.Name.EndsWith("AppService", StringComparison.Ordinal))
            .SelectMany(type => type.GetFields(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic)
                .Where(field => !field.IsLiteral && (!field.IsInitOnly || IsMutableReference(field.FieldType)))
                .Select(field => $"{type.FullName}.{field.Name}: {field.FieldType.FullName}"))
            .ToList();

        violations.Should().BeEmpty();
    }

    [Fact]
    public void EndpointFiles_ShouldNotUseSystemRandom()
    {
        var endpointFiles = Directory.GetFiles(FindRepositoryRoot(), "src/backend/MES.Api/Endpoints/*.cs");
        var violations = endpointFiles
            .Where(file => File.ReadAllText(file).Contains("Random.", StringComparison.Ordinal)
                || File.ReadAllText(file).Contains("new Random", StringComparison.Ordinal))
            .Select(Path.GetFileName)
            .ToList();

        violations.Should().BeEmpty();
    }

    [Fact]
    public void Sprint0DashboardKpi_ShouldHaveDirectRealBrowserDeterministicEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var servicePath = Path.Combine(repositoryRoot, "src/backend/MES.Application/Services/DashboardKpiService.cs");
        var endpointPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/DashboardEndpoints.cs");
        var e2eTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/e2e/dashboard.spec.ts");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var frontendEvidencePath = Path.Combine(repositoryRoot, "_docs/_reports/frontend-real-browser-evidence-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { servicePath, endpointPath, e2eTestPath, matrixPath, frontendEvidencePath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 0 dashboard KPI deterministic evidence.");
            }
        }

        if (File.Exists(servicePath))
        {
            var service = File.ReadAllText(servicePath);
            foreach (var forbiddenToken in new[] { "Random.Shared", "new Random", "Random." })
            {
                if (service.Contains(forbiddenToken, StringComparison.Ordinal))
                {
                    violations.Add($"DashboardKpiService must not use random KPI generation token: {forbiddenToken}");
                }
            }

            foreach (var requiredToken in new[]
            {
                "ProductionKpiCalculator.CalculateOnTimeRate(workOrders, DateTime.UtcNow) * 100",
                "Math.Round(scheduleAdherence, 1)",
                "Math.Round(qualityPassRate, 1)",
                "Math.Round(utilizationRate, 1)",
                "ActiveOrders = activeWo"
            })
            {
                if (!service.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"DashboardKpiService missing deterministic KPI token: {requiredToken}");
                }
            }
        }

        if (File.Exists(endpointPath))
        {
            var endpoint = File.ReadAllText(endpointPath);
            if (!endpoint.Contains("IDashboardKpiService kpiService", StringComparison.Ordinal)
                || !endpoint.Contains("await kpiService.ComputeDashboardAsync(ct)", StringComparison.Ordinal))
            {
                violations.Add("Dashboard endpoint must return IDashboardKpiService output instead of inline/generated KPI values.");
            }
        }

        if (File.Exists(e2eTestPath))
        {
            var e2eTests = File.ReadAllText(e2eTestPath);
            foreach (var requiredToken in new[]
            {
                "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标",
                "const dashboardRequests: string[] = []",
                "localStorage.setItem('aimes_offline_demo', 'false')",
                "page.route('**/api/v1/dashboard'",
                "scheduleAdherence: 91.7",
                "qualityPassRate: 88.4",
                "equipmentUtilization: 63.2",
                "activeOrders: 17",
                "expect(dashboardRequests.some(url => url.includes('/api/v1/dashboard'))).toBe(true)"
            })
            {
                if (!e2eTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"dashboard.spec.ts missing direct deterministic KPI evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Dashboard KPI no Random.Shared",
                "DashboardKpiService",
                "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标",
                "Sprint0DashboardKpi_ShouldHaveDirectRealBrowserDeterministicEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing dashboard KPI direct evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(frontendEvidencePath))
        {
            var frontendEvidence = File.ReadAllText(frontendEvidencePath);
            foreach (var requiredToken in new[]
            {
                "Targeted Dashboard KPI Rerun",
                "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标",
                "91.7%",
                "88.4%",
                "63.2%",
                "17"
            })
            {
                if (!frontendEvidence.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Frontend real-browser evidence missing dashboard KPI token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 0 dashboard KPI no-random acceptance needs direct deterministic service tokens and real Chrome backend-response evidence, not only a broad endpoint Random scan");
    }

    [Fact]
    public void RepositoryReadQueries_ShouldUseAsNoTracking()
    {
        var repositoryFiles = Directory.GetFiles(
            Path.Combine(FindRepositoryRoot(), "src/backend/MES.Infrastructure/Repositories"),
            "*.cs");
        var violations = repositoryFiles
            .SelectMany(file => FindReadMethodsWithoutAsNoTracking(file))
            .ToList();

        violations.Should().BeEmpty();
    }

    [Fact]
    public void CoreRepositories_ShouldBeCoveredByAsNoTrackingGate()
    {
        var repositoryDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Infrastructure/Repositories");
        var expectedCoreRepositories = new[]
        {
            "AnomalyRepository.cs",
            "BomRepository.cs",
            "EmployeeRepository.cs",
            "EquipmentRepository.cs",
            "MaterialRepository.cs",
            "PurchaseOrderRepository.cs",
            "QualityInspectionRepository.cs",
            "ScheduleRepository.cs",
            "WorkOrderRepository.cs"
        };

        var repositoryFiles = Directory.GetFiles(repositoryDirectory, "*.cs")
            .Select(Path.GetFileName)
            .ToHashSet(StringComparer.Ordinal);

        repositoryFiles.Should().Contain(expectedCoreRepositories);
    }

    [Fact]
    public void Sprint2RepositoryAsNoTracking_ShouldHaveDirectChangeTrackerEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Repositories/RepositoryAsNoTrackingTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var partialEvidencePath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-partial-evidence-tightening-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { testPath, matrixPath, partialEvidencePath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for direct repository AsNoTracking evidence.");
            }
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext",
                "queryContext.ChangeTracker.Entries().Should().BeEmpty",
                "WorkOrderRepository(queryContext).GetAllAsync",
                "EquipmentRepository(queryContext).GetAllAsync",
                "MaterialRepository(queryContext).GetAllAsync",
                "BomRepository(queryContext).GetAllAsync",
                "EmployeeRepository(queryContext).GetAllAsync",
                "PurchaseOrderRepository(queryContext).GetAllAsync",
                "QualityInspectionRepository(queryContext).GetAllAsync",
                "ScheduleRepository(queryContext).GetAllAsync(page: 1, pageSize: 20)",
                "UserRepository(queryContext).GetAllAsync"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"RepositoryAsNoTrackingTests.cs missing direct no-tracking evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Repository reads use `AsNoTracking()`",
                "RepositoryAsNoTrackingTests.CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext",
                "ChangeTracker.Entries().Should().BeEmpty",
                "Sprint2RepositoryAsNoTracking_ShouldHaveDirectChangeTrackerEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing repository no-tracking direct evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(partialEvidencePath))
        {
            var partialEvidence = File.ReadAllText(partialEvidencePath);
            foreach (var requiredToken in new[]
            {
                "Repository AsNoTracking runtime evidence",
                "CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext",
                "ChangeTracker.Entries().Should().BeEmpty"
            })
            {
                if (!partialEvidence.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Partial evidence report missing repository no-tracking token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 2 repository no-tracking evidence must include runtime ChangeTracker assertions, not only static AsNoTracking scans");
    }

    [Fact]
    public void ListAppServices_ShouldUseRepositoryPaging()
    {
        var checks = new[]
        {
            new RepositoryPagingCheck("BomAppService.cs", "GetAllBomsAsync", "_bomRepo.GetAllAsync"),
            new RepositoryPagingCheck("EmployeeAppService.cs", "GetAllAsync", "_employeeRepo.GetAllAsync"),
            new RepositoryPagingCheck("EquipmentAppService.cs", "GetEquipmentsAsync", "_equipmentRepo.GetAllAsync"),
            new RepositoryPagingCheck("AdminAppService.cs", "GetAllUsersAsync", "_userRepo.GetAllAsync"),
            new RepositoryPagingCheck("PurchaseAppService.cs", "GetAllAsync", "_orderRepo.GetAllAsync"),
            new RepositoryPagingCheck("RoutingAppService.cs", "GetAllRoutesAsync", "_routingRepo.GetAllAsync"),
            new RepositoryPagingCheck("SchedulingAppService.cs", "GetWorkOrdersAsync", "_workOrderRepo.GetAllAsync")
        };

        var violations = checks
            .SelectMany(check =>
            {
                var source = File.ReadAllText(Path.Combine(
                    FindRepositoryRoot(),
                    "src/backend/MES.Application/Services",
                    check.FileName));
                var methodBody = ExtractMethodBody(source, check.MethodName);
                var failures = new List<string>();

                if (!methodBody.Contains("GetPagedAsync", StringComparison.Ordinal))
                    failures.Add($"{check.FileName}:{check.MethodName}: missing GetPagedAsync");
                if (!methodBody.Contains("CountAsync", StringComparison.Ordinal))
                    failures.Add($"{check.FileName}:{check.MethodName}: missing CountAsync");
                if (methodBody.Contains(check.GetAllCall, StringComparison.Ordinal))
                    failures.Add($"{check.FileName}:{check.MethodName}: uses {check.GetAllCall}");
                if (methodBody.Contains(".Skip(", StringComparison.Ordinal)
                    || methodBody.Contains(".Take(", StringComparison.Ordinal))
                    failures.Add($"{check.FileName}:{check.MethodName}: performs in-memory paging");

                return failures;
            })
            .ToList();

        violations.Should().BeEmpty();
    }

    [Fact]
    public void Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var serviceDirectory = Path.Combine(repositoryRoot, "src/backend/MES.Application/Services");
        var unitTestDirectory = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Application");
        var schedulingControllerTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/SchedulingControllerTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        var requiredPaths = new[]
        {
            Path.Combine(serviceDirectory, "EquipmentAppService.cs"),
            Path.Combine(serviceDirectory, "AdminAppService.cs"),
            Path.Combine(serviceDirectory, "SchedulingAppService.cs"),
            Path.Combine(unitTestDirectory, "EquipmentAppServiceTests.cs"),
            Path.Combine(unitTestDirectory, "AdminAppServiceTests.cs"),
            Path.Combine(unitTestDirectory, "SchedulingAppServiceTests.cs"),
            schedulingControllerTestPath,
            matrixPath
        };

        foreach (var path in requiredPaths)
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 2 critical list pagination evidence.");
            }
        }

        if (File.Exists(Path.Combine(serviceDirectory, "EquipmentAppService.cs")))
        {
            var service = File.ReadAllText(Path.Combine(serviceDirectory, "EquipmentAppService.cs"));
            var methodBody = ExtractMethodBody(service, "GetEquipmentsAsync");

            foreach (var requiredToken in new[]
            {
                "ValidatePaging(page, pageSize);",
                "_equipmentRepo.GetPagedAsync(workshopId, equipmentStatus, page, pageSize, ct)",
                "_equipmentRepo.CountAsync(workshopId, equipmentStatus, ct)",
                "Page = page",
                "PageSize = pageSize"
            })
            {
                if (!methodBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"EquipmentAppService.GetEquipmentsAsync missing paging token: {requiredToken}");
                }
            }

            if (methodBody.Contains("_equipmentRepo.GetAllAsync", StringComparison.Ordinal)
                || methodBody.Contains("_equipmentRepo.GetByWorkshopAsync", StringComparison.Ordinal))
            {
                violations.Add("EquipmentAppService.GetEquipmentsAsync must not use full-list repository reads for paged list responses.");
            }
        }

        if (File.Exists(Path.Combine(serviceDirectory, "AdminAppService.cs")))
        {
            var service = File.ReadAllText(Path.Combine(serviceDirectory, "AdminAppService.cs"));
            var methodBody = ExtractMethodBody(service, "GetAllUsersAsync");

            foreach (var requiredToken in new[]
            {
                "ValidatePaging(page, pageSize);",
                "_userRepo.GetPagedAsync(page, pageSize, ct)",
                "_userRepo.CountAsync(ct)",
                "Page = page",
                "PageSize = pageSize"
            })
            {
                if (!methodBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AdminAppService.GetAllUsersAsync missing paging token: {requiredToken}");
                }
            }

            if (methodBody.Contains("_userRepo.GetAllAsync", StringComparison.Ordinal))
            {
                violations.Add("AdminAppService.GetAllUsersAsync must not use full-list repository reads for paged list responses.");
            }
        }

        if (File.Exists(Path.Combine(serviceDirectory, "SchedulingAppService.cs")))
        {
            var service = File.ReadAllText(Path.Combine(serviceDirectory, "SchedulingAppService.cs"));
            var methodBody = ExtractMethodBody(service, "GetWorkOrdersAsync");

            foreach (var requiredToken in new[]
            {
                "_workOrderRepo.CountAsync(",
                "_workOrderRepo.GetPagedAsync(",
                "parameters.Page",
                "parameters.PageSize",
                "Page = parameters.Page",
                "PageSize = parameters.PageSize"
            })
            {
                if (!methodBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"SchedulingAppService.GetWorkOrdersAsync missing paging token: {requiredToken}");
                }
            }

            if (methodBody.Contains("_workOrderRepo.GetAllAsync", StringComparison.Ordinal))
            {
                violations.Add("SchedulingAppService.GetWorkOrdersAsync must not use full-list repository reads for paged list responses.");
            }
        }

        if (File.Exists(Path.Combine(unitTestDirectory, "EquipmentAppServiceTests.cs")))
        {
            var tests = File.ReadAllText(Path.Combine(unitTestDirectory, "EquipmentAppServiceTests.cs"));
            foreach (var requiredToken in new[]
            {
                "GetEquipmentsAsync_ShouldUseRepositoryPagingForFilters",
                "GetEquipmentsAsync_WithInvalidPaging_ShouldRejectBeforeRepository",
                "GetPagedAsync(\"WS-001\", EquipmentStatus.Running, 2, 1, ct)",
                "result.Page.Should().Be(2)",
                "result.PageSize.Should().Be(1)",
                "GetAllAsync(It.IsAny<CancellationToken>()), Times.Never",
                "GetByWorkshopAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"EquipmentAppServiceTests missing direct paging evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(Path.Combine(unitTestDirectory, "AdminAppServiceTests.cs")))
        {
            var tests = File.ReadAllText(Path.Combine(unitTestDirectory, "AdminAppServiceTests.cs"));
            foreach (var requiredToken in new[]
            {
                "GetAllUsersAsync_ShouldUseRepositoryPaging",
                "GetAllUsersAsync_WithInvalidPaging_ShouldRejectBeforeRepository",
                "GetPagedAsync(2, 1, ct)",
                "result.Page.Should().Be(2)",
                "result.PageSize.Should().Be(1)",
                "GetAllAsync(It.IsAny<CancellationToken>()), Times.Never"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AdminAppServiceTests missing direct paging evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(Path.Combine(unitTestDirectory, "SchedulingAppServiceTests.cs")))
        {
            var tests = File.ReadAllText(Path.Combine(unitTestDirectory, "SchedulingAppServiceTests.cs"));
            foreach (var requiredToken in new[]
            {
                "GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters",
                "Page = 2",
                "PageSize = 2",
                "result.Page.Should().Be(2)",
                "result.PageSize.Should().Be(2)",
                "GetAllAsync(It.IsAny<WorkOrderStatus?>(), It.IsAny<CancellationToken>()), Times.Never",
                "GetPagedAsync(",
                "CountAsync("
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"SchedulingAppServiceTests missing direct paging evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(schedulingControllerTestPath))
        {
            var tests = File.ReadAllText(schedulingControllerTestPath);
            foreach (var requiredToken in new[]
            {
                "GetWorkOrders_WithPaging_ShouldRespectParameters",
                "/api/v1/scheduling/workorders?page=2&pageSize=5",
                "Page.Should().Be(2)",
                "result.PageSize.Should().Be(5)"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"SchedulingControllerTests missing HTTP paging evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Scheduling/Equipment/Admin pagination returns precise page size",
                "EquipmentAppServiceTests.GetEquipmentsAsync_ShouldUseRepositoryPagingForFilters",
                "AdminAppServiceTests.GetAllUsersAsync_ShouldUseRepositoryPaging",
                "SchedulingAppServiceTests.GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters",
                "SchedulingControllerTests.GetWorkOrders_WithPaging_ShouldRespectParameters",
                "Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing critical list pagination direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 2 critical list pagination needs direct page/pageSize propagation tests for Scheduling, Equipment, and Admin, not only broad static repository paging gates");
    }

    [Fact]
    public void ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging()
    {
        var repositoryRoot = FindRepositoryRoot();
        var repositorySource = File.ReadAllText(Path.Combine(
            repositoryRoot,
            "src/backend/MES.Infrastructure/Repositories/ScheduleRepository.cs"));
        var interfaceSource = File.ReadAllText(Path.Combine(
            repositoryRoot,
            "src/backend/MES.Domain/Interfaces/Repositories/IScheduleRepository.cs"));
        var methodBody = ExtractMethodBody(repositorySource, "GetAllAsync");
        var violations = new List<string>();

        if (!interfaceSource.Contains(
            "GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)",
            StringComparison.Ordinal))
        {
            violations.Add("IScheduleRepository.GetAllAsync must expose page and pageSize defaults.");
        }

        if (!methodBody.Contains(".AsSplitQuery()", StringComparison.Ordinal))
        {
            violations.Add("ScheduleRepository.GetAllAsync must use AsSplitQuery for included schedule items.");
        }

        if (!methodBody.Contains(".OrderByDescending(p => p.CreatedAt)", StringComparison.Ordinal)
            || !methodBody.Contains(".ThenBy(p => p.Id)", StringComparison.Ordinal))
        {
            violations.Add("ScheduleRepository.GetAllAsync must order by CreatedAt and Id for stable paging.");
        }

        if (!methodBody.Contains(".Skip((page - 1) * pageSize)", StringComparison.Ordinal)
            || !methodBody.Contains(".Take(pageSize)", StringComparison.Ordinal))
        {
            violations.Add("ScheduleRepository.GetAllAsync must perform repository-level Skip/Take paging.");
        }

        violations.Should().BeEmpty();
    }

    [Fact]
    public void Sprint2ScheduleRepositoryPaging_ShouldHaveDirectSplitQueryEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var repositoryPath = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories/ScheduleRepository.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Repositories/ScheduleRepositoryTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (File.Exists(repositoryPath))
        {
            var repositorySource = File.ReadAllText(repositoryPath);
            var methodBody = ExtractMethodBody(repositorySource, "GetAllAsync");
            foreach (var requiredToken in new[]
            {
                ".AsNoTracking()",
                ".AsSplitQuery()",
                ".Include(p => p.Items)",
                ".OrderByDescending(p => p.CreatedAt)",
                ".ThenBy(p => p.Id)",
                ".Skip((page - 1) * pageSize)",
                ".Take(pageSize)"
            })
            {
                if (!methodBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ScheduleRepository.GetAllAsync missing split/stable paging token: {requiredToken}");
                }
            }
        }
        else
        {
            violations.Add("ScheduleRepository.cs is required for direct split-query paging evidence.");
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "GetAllAsync_UsesSplitQueryAndStablePagedOrdering",
                "var firstPage = await repository.GetAllAsync(page: 1, pageSize: 2)",
                "var secondPage = await repository.GetAllAsync(page: 2, pageSize: 2)",
                "firstPage.Select(p => p.Id).Should().Equal(\"plan-a\", \"plan-b\")",
                "secondPage.Select(p => p.Id).Should().Equal(\"plan-c\")",
                "firstPage.Concat(secondPage).Select(p => p.Id).Should().OnlyHaveUniqueItems()",
                "firstPage.Should().OnlyContain(p => p.Items.Count == 2)",
                "scheduleSelects.Count.Should().BeGreaterThanOrEqualTo(",
                "command.Contains(\"ORDER BY\", StringComparison.OrdinalIgnoreCase)",
                "command.Contains(\"created_at\", StringComparison.OrdinalIgnoreCase)",
                "command.Contains(\"id\", StringComparison.OrdinalIgnoreCase)",
                "command.Contains(\"LIMIT\", StringComparison.OrdinalIgnoreCase)"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ScheduleRepositoryTests missing direct split-query paging evidence token: {requiredToken}");
                }
            }
        }
        else
        {
            violations.Add("ScheduleRepositoryTests.cs is required for direct split-query paging evidence.");
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "`ScheduleRepository.GetAllAsync` uses `AsSplitQuery`, stable ordering, paging",
                "ScheduleRepositoryTests.GetAllAsync_UsesSplitQueryAndStablePagedOrdering",
                "firstPage.Select(p => p.Id).Should().Equal(\"plan-a\", \"plan-b\")",
                "scheduleSelects.Count.Should().BeGreaterThanOrEqualTo",
                "Sprint2ScheduleRepositoryPaging_ShouldHaveDirectSplitQueryEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing ScheduleRepository direct split-query evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 2 ScheduleRepository evidence must cite the integration test that proves split query and stable paged SQL behavior, not only the static architecture gate");
    }

    [Fact]
    public void InventoryTransactionRepositories_ShouldNotCommitInsideRepositoryMethods()
    {
        var repositoryRoot = FindRepositoryRoot();
        var repositoryDirectory = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories");
        var checks = new[]
        {
            new RepositoryCommitCheck("MaterialRepository.cs", "UpdateAsync"),
            new RepositoryCommitCheck("StockTransactionRepository.cs", "AddAsync")
        };

        var violations = checks
            .Where(check =>
            {
                var source = File.ReadAllText(Path.Combine(repositoryDirectory, check.FileName));
                var methodBody = ExtractMethodBody(source, check.MethodName);
                return methodBody.Contains("SaveChangesAsync", StringComparison.Ordinal);
            })
            .Select(check => $"{check.FileName}:{check.MethodName}: commits inside Inventory transaction boundary")
            .ToList();

        violations.Should().BeEmpty("Inventory StockOut relies on IUnitOfWork to atomically commit material changes and stock transactions");
    }

    [Fact]
    public void Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var servicePath = Path.Combine(repositoryRoot, "src/backend/MES.Application/Services/InventoryAppService.cs");
        var materialRepositoryPath = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories/MaterialRepository.cs");
        var transactionRepositoryPath = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories/StockTransactionRepository.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Repositories/InventoryTransactionRepositoryTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { servicePath, materialRepositoryPath, transactionRepositoryPath, testPath, matrixPath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 2 Inventory StockOut transaction evidence.");
            }
        }

        if (File.Exists(servicePath))
        {
            var service = File.ReadAllText(servicePath);
            var stockOutBody = ExtractMethodBody(service, "StockOutAsync");

            foreach (var requiredToken in new[]
            {
                "_unitOfWork.ExecuteAsync(async innerCt =>",
                "_materialRepo.GetByCodeForUpdateAsync(request.MaterialCode, innerCt)",
                "material.Consume(request.Quantity)",
                "await _materialRepo.UpdateAsync(material, innerCt);",
                "TransactionType.StockOut",
                "await _txRepo.AddAsync(tx, innerCt);",
                "await WriteTransactionAuditAsync(\"InventoryStockOut\", tx, innerCt);",
                "return MapTransaction(tx);"
            })
            {
                if (!stockOutBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"InventoryAppService.StockOutAsync missing atomic transaction token: {requiredToken}");
                }
            }

            var unitOfWorkIndex = stockOutBody.IndexOf("_unitOfWork.ExecuteAsync", StringComparison.Ordinal);
            var consumeIndex = stockOutBody.IndexOf("material.Consume(request.Quantity)", StringComparison.Ordinal);
            var materialUpdateIndex = stockOutBody.IndexOf("_materialRepo.UpdateAsync(material, innerCt)", StringComparison.Ordinal);
            var transactionAddIndex = stockOutBody.IndexOf("_txRepo.AddAsync(tx, innerCt)", StringComparison.Ordinal);
            var auditIndex = stockOutBody.IndexOf("WriteTransactionAuditAsync(\"InventoryStockOut\", tx, innerCt)", StringComparison.Ordinal);
            var returnIndex = stockOutBody.IndexOf("return MapTransaction(tx);", StringComparison.Ordinal);

            if (unitOfWorkIndex < 0
                || consumeIndex < unitOfWorkIndex
                || materialUpdateIndex < consumeIndex
                || transactionAddIndex < materialUpdateIndex
                || auditIndex < transactionAddIndex
                || returnIndex < auditIndex)
            {
                violations.Add("Inventory StockOut must consume material, update material, add stock transaction, write audit, and return inside one UnitOfWork lambda.");
            }
        }

        if (File.Exists(materialRepositoryPath))
        {
            var materialRepository = File.ReadAllText(materialRepositoryPath);
            var updateBody = ExtractMethodBody(materialRepository, "UpdateAsync");
            if (updateBody.Contains("SaveChangesAsync", StringComparison.Ordinal))
            {
                violations.Add("MaterialRepository.UpdateAsync must not self-commit; StockOut material decrement must commit or roll back with the stock transaction.");
            }
        }

        if (File.Exists(transactionRepositoryPath))
        {
            var transactionRepository = File.ReadAllText(transactionRepositoryPath);
            var addBody = ExtractMethodBody(transactionRepository, "AddAsync");
            if (addBody.Contains("SaveChangesAsync", StringComparison.Ordinal))
            {
                violations.Add("StockTransactionRepository.AddAsync must not self-commit; StockOut transaction rows must share the surrounding UnitOfWork commit point.");
            }
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork",
                "StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement",
                "PostgreSqlIntegrationTestScope.CreateAsync",
                "new EfUnitOfWork(actContext)",
                "new AuditLogAppService(new AuditLogRepository(actContext))",
                "material.AvailableQuantity.Should().Be(70",
                "transaction.TransactionType.ToString().Should().Be(\"StockOut\")",
                "auditLog.Resource.Should().Be(\"Inventory\")",
                "ThrowingStockTransactionRepository",
                "throw new InvalidOperationException(\"stock transaction write failed\")",
                "material.AvailableQuantity.Should().Be(100",
                "transactionCount.Should().Be(0)"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Inventory transaction integration tests missing atomic evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Inventory StockOut material + stock transaction commit atomically",
                "InventoryAppService.StockOutAsync",
                "material.Consume(request.Quantity)",
                "StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork",
                "StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement",
                "ThrowingStockTransactionRepository",
                "material.AvailableQuantity.Should().Be(100",
                "Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing Inventory StockOut direct atomic evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 2 Inventory StockOut needs direct atomic commit and rollback evidence, not only broad repository self-commit gates");
    }

    [Fact]
    public void PurchaseWrites_ShouldUseUnitOfWorkAndRepositoriesShouldNotSelfCommit()
    {
        var repositoryRoot = FindRepositoryRoot();
        var repositoryDirectory = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories");
        var serviceSource = File.ReadAllText(Path.Combine(
            repositoryRoot,
            "src/backend/MES.Application/Services/PurchaseAppService.cs"));
        var repositorySource = File.ReadAllText(Path.Combine(repositoryDirectory, "PurchaseOrderRepository.cs"));
        var violations = new List<string>();

        if (!serviceSource.Contains("IUnitOfWork", StringComparison.Ordinal))
        {
            violations.Add("PurchaseAppService must depend on IUnitOfWork.");
        }

        foreach (var methodName in new[] { "CreateAsync", "SubmitAsync", "ConfirmAsync", "ReceiveAsync", "CancelAsync" })
        {
            var methodBody = ExtractMethodBody(serviceSource, methodName);
            if (!methodBody.Contains("_unitOfWork.ExecuteAsync", StringComparison.Ordinal))
            {
                violations.Add($"PurchaseAppService.{methodName}: missing IUnitOfWork transaction boundary");
            }
        }

        foreach (var methodName in new[] { "AddAsync", "UpdateAsync" })
        {
            var methodBody = ExtractMethodBody(repositorySource, methodName);
            if (methodBody.Contains("SaveChangesAsync", StringComparison.Ordinal))
            {
                violations.Add($"PurchaseOrderRepository.{methodName}: commits inside Purchase transaction boundary");
            }
        }

        violations.Should().BeEmpty("Purchase status changes are part of the B4 critical aggregates that require a single UoW commit point");
    }

    [Fact]
    public void Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var endpointPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/AnomalyEndpoints.cs");
        var auditRepositoryPath = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories/AuditLogRepository.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AnomalyControllerTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { endpointPath, auditRepositoryPath, testPath, matrixPath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 2 anomaly create transaction rollback evidence.");
            }
        }

        if (File.Exists(endpointPath))
        {
            var endpoint = File.ReadAllText(endpointPath);
            var createBody = ExtractMethodBody(endpoint, "CreateAsync");

            if (!endpoint.Contains("IUnitOfWork unitOfWork", StringComparison.Ordinal))
            {
                violations.Add("AnomalyEndpoints.CreateAsync must accept IUnitOfWork so the create/audit/notification path has a single commit boundary.");
            }

            foreach (var requiredToken in new[]
            {
                "await unitOfWork.ExecuteAsync(async innerCt =>",
                "anomalyService.CreateAnomalyAsync(request, innerCt)",
                "auditLog.WriteAuditLogAsync",
                "resource: \"Anomaly\"",
                "action: \"CREATE\"",
                "notification.NotifyAnomaly",
                "return created;"
            })
            {
                if (!createBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AnomalyEndpoints.CreateAsync missing transaction token: {requiredToken}");
                }
            }

            var unitOfWorkIndex = createBody.IndexOf("unitOfWork.ExecuteAsync", StringComparison.Ordinal);
            var createIndex = createBody.IndexOf("anomalyService.CreateAnomalyAsync", StringComparison.Ordinal);
            var auditIndex = createBody.IndexOf("auditLog.WriteAuditLogAsync", StringComparison.Ordinal);
            var notificationIndex = createBody.IndexOf("notification.NotifyAnomaly", StringComparison.Ordinal);
            var createdResultIndex = createBody.IndexOf("TypedResults.Created", StringComparison.Ordinal);

            if (unitOfWorkIndex < 0 || createIndex < unitOfWorkIndex || auditIndex < unitOfWorkIndex || notificationIndex < unitOfWorkIndex)
            {
                violations.Add("Anomaly create, audit, and notification must all execute inside the UnitOfWork lambda before the transaction can commit.");
            }

            if (notificationIndex >= 0 && createdResultIndex >= 0 && notificationIndex > createdResultIndex)
            {
                violations.Add("Anomaly notification must happen before returning Created so notification failure can fail closed before commit.");
            }
        }

        if (File.Exists(auditRepositoryPath))
        {
            var auditRepository = File.ReadAllText(auditRepositoryPath);
            var addBody = ExtractMethodBody(auditRepository, "AddAsync");
            if (addBody.Contains("SaveChangesAsync", StringComparison.Ordinal))
            {
                violations.Add("AuditLogRepository.AddAsync must not self-commit; anomaly create audit rows must be committed or rolled back by the surrounding UnitOfWork.");
            }
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit",
                "AnomalyTransactionWebApplicationFactory",
                "services.AddScoped<INotificationService, ThrowingNotificationService>()",
                "public sealed class ThrowingNotificationService : INotificationService",
                "throw new Exception(\"Notification failure for transaction rollback test.\")",
                "response.StatusCode.Should().Be(HttpStatusCode.InternalServerError)",
                "db.ProductionAnomalies.Should().NotContain(a => a.Title == title)",
                "db.AuditLogs.Should().NotContain(a =>",
                "a.Resource == \"Anomaly\"",
                "a.Action == \"CREATE\"",
                "a.NewValues.Contains(title)"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Anomaly transaction integration test missing rollback token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Anomaly create transaction rolls back anomaly/audit/notification together",
                "AnomalyEndpoints.CreateAsync",
                "IUnitOfWork.ExecuteAsync",
                "Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit",
                "ThrowingNotificationService",
                "ProductionAnomalies.Should().NotContain",
                "AuditLogs.Should().NotContain",
                "Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing anomaly transaction rollback token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 2 anomaly create needs direct fail-closed transaction evidence: create, audit, and notification before commit, with notification failure rolling back anomaly and audit persistence");
    }

    [Fact]
    public void ProductionOperationRepositories_ShouldNotCommitInsideOperationUnitOfWork()
    {
        var repositoryRoot = FindRepositoryRoot();
        var repositoryDirectory = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories");
        var checks = new[]
        {
            new RepositoryCommitCheck("OperationRepository.cs", "AddExecutionAsync"),
            new RepositoryCommitCheck("OperationRepository.cs", "UpdateExecutionAsync"),
            new RepositoryCommitCheck("OperationRepository.cs", "AddReportAsync"),
            new RepositoryCommitCheck("WorkOrderRepository.cs", "UpdateAsync"),
        };

        var violations = checks
            .Where(check =>
            {
                var source = File.ReadAllText(Path.Combine(repositoryDirectory, check.FileName));
                var methodBody = ExtractMethodBody(source, check.MethodName);
                return methodBody.Contains("SaveChangesAsync", StringComparison.Ordinal);
            })
            .Select(check => $"{check.FileName}:{check.MethodName}: commits inside Operation transaction boundary")
            .ToList();

        violations.Should().BeEmpty("OperationService.CompleteAsync relies on IUnitOfWork to atomically commit execution, work order, and report writes");
    }

    [Fact]
    public void H1TargetAppServices_ShouldPropagateCancellationTokenToRepositoryCalls()
    {
        var serviceDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Application/Services");
        var checks = new[]
        {
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_equipmentRepo.GetByWorkshopAsync(request.WorkshopId)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_scheduleRepo.CreateAsync(plan)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_scheduleRepo.GetCurrentPlanAsync()"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_scheduleRepo.GetByIdAsync(id)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_scheduleRepo.GetAllAsync()"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_workOrderRepo.CreateAsync(workOrder)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_workOrderRepo.GetByIdAsync(id)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_workOrderRepo.UpdateAsync(workOrder)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_workOrderRepo.DeleteAsync(id)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_scheduleRepo.SaveFeedbackAsync(feedback)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_workOrderRepo.GetAllAsync(WorkOrderStatus.Created)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_workOrderRepo.GetAllAsync(WorkOrderStatus.Scheduled)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_materialRepo.GetByCodeAsync(code)"),
            new CancellationTokenPropagationCheck("SchedulingAppService.cs", "_bomRepo.GetByProductCodeAsync(new MES.Domain.ValueObjects.ProductCode(productCode))"),
            new CancellationTokenPropagationCheck("QualityAppService.cs", "_inspectionRepo.CreateAsync(inspection)"),
            new CancellationTokenPropagationCheck("QualityAppService.cs", "_inspectionRepo.GetByIdAsync(id)"),
            new CancellationTokenPropagationCheck("QualityAppService.cs", "_inspectionRepo.GetByWorkOrderAsync(workOrderId)"),
            new CancellationTokenPropagationCheck("QualityAppService.cs", "_inspectionRepo.GetAllAsync()"),
            new CancellationTokenPropagationCheck("QualityAppService.cs", "_inspectionRepo.GetByIdAsync(inspectionId)"),
            new CancellationTokenPropagationCheck("QualityAppService.cs", "_inspectionRepo.GetRecentInspectionsAsync(processParameter, windowSize)"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.CreateAsync(equipment)"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.GetByIdAsync(id)"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.GetAllAsync()"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.GetByWorkshopAsync(workshopId)"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.UpdateAsync(equipment)"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.GetByIdAsync(equipmentId)"),
            new CancellationTokenPropagationCheck("EquipmentAppService.cs", "_equipmentRepo.GetFailureHistoryAsync(equipmentId)")
        };

        var violations = checks
            .Where(check =>
            {
                var source = File.ReadAllText(Path.Combine(serviceDirectory, check.FileName));
                return source.Contains(check.ForbiddenCall, StringComparison.Ordinal);
            })
            .Select(check => $"{check.FileName}: missing CancellationToken in {check.ForbiddenCall}")
            .ToList();

        violations.Should().BeEmpty("Sprint 2 H1 requires Scheduling, Quality, and Equipment app services to propagate CancellationToken through repository I/O");
    }

    [Fact]
    public void H1KnowledgeAppService_ShouldPropagateCancellationTokenToVectorStoreCalls()
    {
        var serviceDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Application/Services");
        var checks = new[]
        {
            new CancellationTokenPropagationCheck("KnowledgeAppService.cs", "_vectorStore.SearchAsync(KnowledgeCollectionName, embedding, request.TopK)"),
            new CancellationTokenPropagationCheck("KnowledgeAppService.cs", "_vectorStore.UpsertAsync(KnowledgeCollectionName, chunkEntities)")
        };

        var violations = checks
            .Where(check =>
            {
                var source = File.ReadAllText(Path.Combine(serviceDirectory, check.FileName));
                return source.Contains(check.ForbiddenCall, StringComparison.Ordinal);
            })
            .Select(check => $"{check.FileName}: missing CancellationToken in {check.ForbiddenCall}")
            .ToList();

        violations.Should().BeEmpty("Sprint 5 H1 extension requires KnowledgeAppService to propagate CancellationToken through vector store I/O");
    }

    [Fact]
    public void H1OperationService_ShouldPropagateCancellationTokenToWorkOrderRepositoryCalls()
    {
        var serviceDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Application/Services");
        var checks = new[]
        {
            new CancellationTokenPropagationCheck("OperationService.cs", "_workOrderRepository.GetAllAsync()"),
            new CancellationTokenPropagationCheck("OperationService.cs", "_workOrderRepository.GetByIdAsync(execution.WorkOrderId)"),
            new CancellationTokenPropagationCheck("OperationService.cs", "_workOrderRepository.UpdateAsync(workOrder)")
        };

        var violations = checks
            .Where(check =>
            {
                var source = File.ReadAllText(Path.Combine(serviceDirectory, check.FileName));
                return source.Contains(check.ForbiddenCall, StringComparison.Ordinal);
            })
            .Select(check => $"{check.FileName}: missing CancellationToken in {check.ForbiddenCall}")
            .ToList();

        violations.Should().BeEmpty("Sprint 5 H1 extension requires OperationService to propagate CancellationToken through work order repository I/O");
    }

    [Fact]
    public void M5TargetDomainEntities_ShouldNotExposeInternalSetters()
    {
        var targetTypes = new[]
        {
            typeof(Material),
            typeof(QualityInspection),
            typeof(SchedulePlan)
        };

        var violations = targetTypes
            .SelectMany(type => type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
                .Select(property => new { Type = type, Property = property, Setter = property.SetMethod })
                .Where(candidate => candidate.Setter is { IsAssembly: true })
                .Select(candidate => $"{candidate.Type.Name}.{candidate.Property.Name} has internal setter"))
            .ToList();

        violations.Should().BeEmpty("Sprint 2 M5 requires Material, QualityInspection, and SchedulePlan setters to be private rather than internal");
    }

    [Fact]
    public void H5DomainEntities_ShouldNotUseNotMappedAnnotationsAndFluentApiShouldIgnoreRuntimeProperties()
    {
        var repositoryRoot = FindRepositoryRoot();
        var domainRoot = Path.Combine(repositoryRoot, "src/backend/MES.Domain");
        var violations = Directory.GetFiles(Path.Combine(domainRoot, "Entities"), "*.cs", SearchOption.AllDirectories)
            .SelectMany(file => File.ReadLines(file)
                .Select((line, index) => new
                {
                    File = Path.GetRelativePath(domainRoot, file),
                    LineNumber = index + 1,
                    Text = line.Trim()
                })
                .Where(candidate => candidate.Text.Contains("[NotMapped", StringComparison.Ordinal)
                    || candidate.Text.Contains("System.ComponentModel.DataAnnotations.Schema", StringComparison.Ordinal))
                .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text}"))
            .ToList();

        using var db = CreateModelOnlyDbContext();
        foreach (var ignoredProperty in new[]
        {
            (Type: typeof(WorkOrder), Property: nameof(WorkOrder.CustomFields)),
            (Type: typeof(DocumentChunk), Property: nameof(DocumentChunk.Metadata)),
            (Type: typeof(DocumentChunk), Property: nameof(DocumentChunk.Vector)),
            (Type: typeof(EquipmentTelemetry), Property: nameof(EquipmentTelemetry.Parameters)),
            (Type: typeof(QualityInspection), Property: nameof(QualityInspection.MeasurementData))
        })
        {
            var entityType = db.Model.FindEntityType(ignoredProperty.Type);
            if (entityType?.FindProperty(ignoredProperty.Property) is not null
                || entityType?.FindNavigation(ignoredProperty.Property) is not null)
            {
                violations.Add($"{ignoredProperty.Type.Name}.{ignoredProperty.Property}: must be ignored by Fluent API instead of Domain attributes");
            }
        }

        violations.Should().BeEmpty("Sprint 5 H5 requires Domain entities to stay free of EF NotMapped attributes while Infrastructure Fluent API owns ignored persistence members");
    }

    [Fact]
    public void M1M2JwtConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var authEndpointsSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/AuthEndpoints.cs"));
        var jwtOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/JwtOptions.cs");
        var jwtOptionsSource = File.Exists(jwtOptionsPath) ? File.ReadAllText(jwtOptionsPath) : string.Empty;
        var violations = new List<string>();

        if (!jwtOptionsSource.Contains("public sealed class JwtOptions", StringComparison.Ordinal)
            || !jwtOptionsSource.Contains("[Required]", StringComparison.Ordinal)
            || !jwtOptionsSource.Contains("SigningKey", StringComparison.Ordinal)
            || !jwtOptionsSource.Contains("Issuer", StringComparison.Ordinal)
            || !jwtOptionsSource.Contains("Audience", StringComparison.Ordinal))
        {
            violations.Add("JwtOptions must define validated SigningKey, Issuer, and Audience settings.");
        }

        if (!programSource.Contains("AddOptions<JwtOptions>()", StringComparison.Ordinal)
            || !programSource.Contains(".Bind(builder.Configuration.GetSection(JwtOptions.SectionName))", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !programSource.Contains(".Validate(JwtOptions.HasValidSigningKey", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must register JwtOptions with DataAnnotations, signing key validation, and ValidateOnStart.");
        }

        if (programSource.Contains("builder.Configuration.GetSection(\"Jwt\")", StringComparison.Ordinal)
            || programSource.Contains("jwtSection[", StringComparison.Ordinal)
            || programSource.Contains("configuredSigningKey", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must not read Jwt configuration through raw IConfiguration variables.");
        }

        if (!programSource.Contains("builder.Services.AddSingleton<SigningKeyStore>(sp =>", StringComparison.Ordinal)
            || !programSource.Contains("sp.GetRequiredService<IOptions<JwtOptions>>().Value.SigningKey", StringComparison.Ordinal))
        {
            violations.Add("SigningKeyStore must be constructed from validated JwtOptions.");
        }

        if (authEndpointsSource.Contains("IConfiguration configuration", StringComparison.Ordinal)
            || authEndpointsSource.Contains("configuration.GetSection(\"Jwt\")", StringComparison.Ordinal))
        {
            violations.Add("AuthEndpoints must use IOptions<JwtOptions> rather than IConfiguration.");
        }

        if (!authEndpointsSource.Contains("IOptions<JwtOptions>", StringComparison.Ordinal)
            || !authEndpointsSource.Contains("jwtOptions.Value", StringComparison.Ordinal))
        {
            violations.Add("AuthEndpoints must read issuer and audience from JwtOptions.");
        }

        violations.Should().BeEmpty("Sprint 5 M1/M2 requires JWT configuration to flow through validated IOptions<T> and fail at startup when invalid");
    }

    [Fact]
    public void Sprint0JwtSigningKey_ShouldHaveDirectFailClosedStartupEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs");
        var jwtOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/JwtOptions.cs");
        var authEndpointsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/AuthEndpoints.cs");
        var startupTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Security/JwtStartupValidationTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { programPath, jwtOptionsPath, authEndpointsPath, startupTestPath, matrixPath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 0 JWT signing-key evidence.");
            }
        }

        if (File.Exists(jwtOptionsPath))
        {
            var jwtOptionsSource = File.ReadAllText(jwtOptionsPath);
            foreach (var requiredToken in new[]
            {
                "public sealed class JwtOptions",
                "public const string SectionName = \"Jwt\"",
                "[Required]",
                "public string SigningKey { get; init; } = string.Empty;",
                "Encoding.UTF8.GetByteCount(options.SigningKey) >= 32"
            })
            {
                if (!jwtOptionsSource.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"JwtOptions.cs missing fail-closed signing-key token: {requiredToken}");
                }
            }
        }

        if (File.Exists(programPath))
        {
            var programSource = File.ReadAllText(programPath);
            foreach (var requiredToken in new[]
            {
                "builder.Services.AddOptions<JwtOptions>()",
                ".Bind(builder.Configuration.GetSection(JwtOptions.SectionName))",
                ".ValidateDataAnnotations()",
                ".Validate(JwtOptions.HasValidSigningKey, \"Jwt:SigningKey must be at least 32 bytes.\")",
                ".ValidateOnStart()",
                "sp.GetRequiredService<IOptions<JwtOptions>>().Value.SigningKey",
                "ValidateIssuerSigningKey = true",
                "IssuerSigningKeyResolver"
            })
            {
                if (!programSource.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Program.cs missing JWT production config gate token: {requiredToken}");
                }
            }

            foreach (var forbiddenToken in new[]
            {
                "configuredSigningKey",
                "builder.Configuration.GetSection(\"Jwt\")",
                "jwtSection["
            })
            {
                if (programSource.Contains(forbiddenToken, StringComparison.Ordinal))
                {
                    violations.Add($"Program.cs must not bypass JwtOptions with raw configuration token: {forbiddenToken}");
                }
            }
        }

        if (File.Exists(authEndpointsPath))
        {
            var authEndpointsSource = File.ReadAllText(authEndpointsPath);
            foreach (var requiredToken in new[]
            {
                "IOptions<JwtOptions> jwtOptions",
                "GenerateToken(request.Username, role, displayName, mustChangePassword, keyStore, jwtOptions.Value)",
                "issuer: jwtOptions.Issuer",
                "audience: jwtOptions.Audience",
                "SigningCredentials(key, SecurityAlgorithms.HmacSha256)"
            })
            {
                if (!authEndpointsSource.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthEndpoints.cs missing validated JwtOptions signing token: {requiredToken}");
                }
            }
        }

        if (File.Exists(startupTestPath))
        {
            var startupTests = File.ReadAllText(startupTestPath);
            foreach (var requiredToken in new[]
            {
                "CreateClient_WithMissingSigningKey_ShouldRejectStartup",
                "TemporaryEnvironmentVariable.Set(\"Jwt__SigningKey\", \"\")",
                "CreateClient_WithSigningKeyShorterThan32Bytes_ShouldRejectStartup",
                "TemporaryEnvironmentVariable.Set(\"Jwt__SigningKey\", \"short-key\")",
                "Throw<OptionsValidationException>()",
                ".WithMessage(\"*Jwt:SigningKey*\")",
                ".WithMessage(\"*32 bytes*\")"
            })
            {
                if (!startupTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"JwtStartupValidationTests.cs missing fail-closed startup token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "JWT signing key fail-closed and production config gate",
                "JwtStartupValidationTests",
                "CreateClient_WithMissingSigningKey_ShouldRejectStartup",
                "CreateClient_WithSigningKeyShorterThan32Bytes_ShouldRejectStartup",
                "Sprint0JwtSigningKey_ShouldHaveDirectFailClosedStartupEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing JWT fail-closed direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 0 JWT signing key gate needs direct fail-closed startup tests and validated-options evidence, not only broad security self-assessment wording");
    }

    [Fact]
    public void M1M2CorsConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var corsOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/CorsOptions.cs");
        var corsOptionsSource = File.Exists(corsOptionsPath) ? File.ReadAllText(corsOptionsPath) : string.Empty;
        var violations = new List<string>();

        if (!corsOptionsSource.Contains("public sealed class CorsOptions", StringComparison.Ordinal)
            || !corsOptionsSource.Contains("[Required]", StringComparison.Ordinal)
            || !corsOptionsSource.Contains("AllowedOrigins", StringComparison.Ordinal)
            || !corsOptionsSource.Contains("HasAllowedOrigins", StringComparison.Ordinal)
            || !corsOptionsSource.Contains("GetNormalizedAllowedOrigins", StringComparison.Ordinal))
        {
            violations.Add("CorsOptions must define validated AllowedOrigins settings.");
        }

        if (!serviceCollectionSource.Contains("AddOptions<CorsOptions>(CorsOptions.OptionsName)", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Bind(configuration)", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Validate(CorsOptions.HasAllowedOrigins", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("AddCorsServices must register CorsOptions with DataAnnotations, allowed origin validation, and ValidateOnStart.");
        }

        var addCorsBody = ExtractMethodBody(serviceCollectionSource, "AddCorsServices");
        if (addCorsBody.Contains("configuration.GetSection(\"AllowedOrigins\")", StringComparison.Ordinal)
            || addCorsBody.Contains("throw new InvalidOperationException", StringComparison.Ordinal)
            || addCorsBody.Contains("BuildServiceProvider", StringComparison.Ordinal))
        {
            violations.Add("AddCorsServices must not manually read/throw for AllowedOrigins or build an ad-hoc service provider.");
        }

        if (!addCorsBody.Contains("configuration.Bind(productionCorsOptions)", StringComparison.Ordinal)
            || !addCorsBody.Contains("productionCorsOptions.GetNormalizedAllowedOrigins()", StringComparison.Ordinal))
        {
            violations.Add("Production CORS policy must read allowed origins from CorsOptions.");
        }

        violations.Should().BeEmpty("Sprint 5 M1/M2 requires CORS configuration to flow through validated IOptions<T> and fail at startup when invalid");
    }

    [Fact]
    public void Sprint0ProductionCors_ShouldHaveDirectNoWildcardEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var corsOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/CorsOptions.cs");
        var serviceCollectionPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs");
        var corsTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Security/CorsPolicyTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { corsOptionsPath, serviceCollectionPath, corsTestPath, matrixPath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 0 Production CORS evidence.");
            }
        }

        if (File.Exists(corsOptionsPath))
        {
            var corsOptionsSource = File.ReadAllText(corsOptionsPath);
            foreach (var requiredToken in new[]
            {
                "public sealed class CorsOptions",
                "public const string OptionsName = \"Production\"",
                "[Required]",
                "public string[] AllowedOrigins { get; init; } = [];",
                "AllowedOrigins.Any(origin => !string.IsNullOrWhiteSpace(origin))",
                "GetNormalizedAllowedOrigins()",
                "Distinct(StringComparer.OrdinalIgnoreCase)"
            })
            {
                if (!corsOptionsSource.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"CorsOptions.cs missing Production CORS validation token: {requiredToken}");
                }
            }
        }

        if (File.Exists(serviceCollectionPath))
        {
            var serviceCollectionSource = File.ReadAllText(serviceCollectionPath);
            var addCorsBody = ExtractMethodBody(serviceCollectionSource, "AddCorsServices");
            foreach (var requiredToken in new[]
            {
                "services.AddOptions<CorsOptions>(CorsOptions.OptionsName)",
                ".Validate(CorsOptions.HasAllowedOrigins, \"AllowedOrigins must contain at least one origin for the Production CORS policy.\")",
                ".ValidateOnStart()",
                "var allowedOrigins = productionCorsOptions.GetNormalizedAllowedOrigins();",
                "options.AddPolicy(\"Production\", builder =>",
                "builder.WithOrigins(allowedOrigins)",
                ".AllowCredentials()"
            })
            {
                if (!addCorsBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AddCorsServices missing Production CORS token: {requiredToken}");
                }
            }

            var productionPolicyStart = addCorsBody.IndexOf("options.AddPolicy(\"Production\"", StringComparison.Ordinal);
            if (productionPolicyStart < 0)
            {
                violations.Add("AddCorsServices must define a Production CORS policy.");
            }
            else
            {
                var productionPolicyBody = addCorsBody[productionPolicyStart..];
                var nextPolicyIndex = productionPolicyBody.IndexOf("options.AddPolicy(", "options.AddPolicy(\"Production\"".Length, StringComparison.Ordinal);
                if (nextPolicyIndex > 0)
                {
                    productionPolicyBody = productionPolicyBody[..nextPolicyIndex];
                }

                if (productionPolicyBody.Contains("AllowAnyOrigin()", StringComparison.Ordinal))
                {
                    violations.Add("Production CORS policy must never call AllowAnyOrigin().");
                }
            }
        }

        if (File.Exists(corsTestPath))
        {
            var corsTests = File.ReadAllText(corsTestPath);
            foreach (var requiredToken in new[]
            {
                "ProductionPolicy_WithConfiguredOrigin_ShouldEchoOriginWithoutWildcard",
                "[\"AllowedOrigins:0\"] = \"https://mes.example.com\"",
                "policy!.AllowAnyOrigin.Should().BeFalse",
                "policy.Origins.Should().ContainSingle().Which.Should().Be(\"https://mes.example.com\")",
                "ProductionPolicy_WithoutAllowedOrigins_ShouldRejectStartup",
                "Throw<OptionsValidationException>()",
                ".WithMessage(\"*AllowedOrigins*\")"
            })
            {
                if (!corsTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"CorsPolicyTests.cs missing Production CORS evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Production CORS not AllowAnyOrigin",
                "CorsPolicyTests",
                "ProductionPolicy_WithConfiguredOrigin_ShouldEchoOriginWithoutWildcard",
                "ProductionPolicy_WithoutAllowedOrigins_ShouldRejectStartup",
                "Sprint0ProductionCors_ShouldHaveDirectNoWildcardEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing Production CORS direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 0 Production CORS needs direct no-wildcard policy tests and validated-options evidence, not only broad Attack Chain C wording");
    }

    [Fact]
    public void M1M2DatabaseConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var databaseOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/DatabaseOptions.cs");
        var databaseOptionsSource = File.Exists(databaseOptionsPath) ? File.ReadAllText(databaseOptionsPath) : string.Empty;
        var addDatabaseBody = ExtractMethodBody(serviceCollectionSource, "AddDatabaseServices");
        var violations = new List<string>();

        if (!databaseOptionsSource.Contains("public sealed class DatabaseOptions", StringComparison.Ordinal)
            || !databaseOptionsSource.Contains("[Required]", StringComparison.Ordinal)
            || !databaseOptionsSource.Contains("Provider", StringComparison.Ordinal)
            || !databaseOptionsSource.Contains("DefaultConnection", StringComparison.Ordinal)
            || !databaseOptionsSource.Contains("HasSupportedProvider", StringComparison.Ordinal)
            || !databaseOptionsSource.Contains("HasDefaultConnection", StringComparison.Ordinal)
            || !databaseOptionsSource.Contains("GetResolvedProvider", StringComparison.Ordinal))
        {
            violations.Add("DatabaseOptions must define validated Provider and DefaultConnection settings.");
        }

        if (!serviceCollectionSource.Contains("AddOptions<DatabaseOptions>()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Configure<IConfiguration>(DatabaseOptions.BindFromConfiguration)", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Validate(DatabaseOptions.HasSupportedProvider", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Validate(DatabaseOptions.HasDefaultConnection", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("AddDatabaseServices must register DatabaseOptions with provider/connection validation and ValidateOnStart.");
        }

        if (addDatabaseBody.Contains("configuration[\"Database:Provider\"]", StringComparison.Ordinal)
            || addDatabaseBody.Contains("configuration.GetConnectionString(\"DefaultConnection\")", StringComparison.Ordinal)
            || addDatabaseBody.Contains("throw new InvalidOperationException", StringComparison.Ordinal)
            || addDatabaseBody.Contains("BuildServiceProvider", StringComparison.Ordinal))
        {
            violations.Add("AddDatabaseServices must not manually read/throw for Database provider or DefaultConnection.");
        }

        if (!addDatabaseBody.Contains("sp.GetRequiredService<IOptions<DatabaseOptions>>().Value", StringComparison.Ordinal)
            || !addDatabaseBody.Contains("databaseOptions.GetResolvedProvider()", StringComparison.Ordinal)
            || !addDatabaseBody.Contains("databaseOptions.DefaultConnection", StringComparison.Ordinal))
        {
            violations.Add("DbContext registration must read provider and connection string from validated DatabaseOptions.");
        }

        if (programSource.Contains("builder.Configuration.GetConnectionString(\"DefaultConnection\")", StringComparison.Ordinal)
            || programSource.Contains("DatabaseProvider.Resolve(builder.Configuration[\"Database:Provider\"])", StringComparison.Ordinal))
        {
            violations.Add("Program.cs health checks must use DatabaseOptions rather than raw Database configuration.");
        }

        violations.Should().BeEmpty("Sprint 5 M1/M2 requires database configuration to flow through validated IOptions<T> and fail at startup when invalid");
    }

    [Fact]
    public void M3MessagingConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var messagingOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/MessagingOptions.cs");
        var messagingOptionsSource = File.Exists(messagingOptionsPath) ? File.ReadAllText(messagingOptionsPath) : string.Empty;
        var addMessagingBody = ExtractMethodBody(serviceCollectionSource, "AddMessagingServices");
        var violations = new List<string>();

        if (!messagingOptionsSource.Contains("public sealed class MessagingOptions", StringComparison.Ordinal)
            || !messagingOptionsSource.Contains("[Required]", StringComparison.Ordinal)
            || !messagingOptionsSource.Contains("Transport", StringComparison.Ordinal)
            || !messagingOptionsSource.Contains("RabbitMqConnection", StringComparison.Ordinal)
            || !messagingOptionsSource.Contains("HasSupportedTransport", StringComparison.Ordinal)
            || !messagingOptionsSource.Contains("HasRequiredConnection", StringComparison.Ordinal)
            || !messagingOptionsSource.Contains("BindFromConfiguration", StringComparison.Ordinal))
        {
            violations.Add("MessagingOptions must define validated Transport and RabbitMqConnection settings.");
        }

        if (!serviceCollectionSource.Contains("AddOptions<MessagingOptions>()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Configure<IConfiguration>(MessagingOptions.BindFromConfiguration)", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Validate(MessagingOptions.HasSupportedTransport", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Validate(MessagingOptions.HasRequiredConnection", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("AddMessagingServices must register MessagingOptions with transport/connection validation and ValidateOnStart.");
        }

        if (addMessagingBody.Contains("configuration[\"Messaging:Transport\"]", StringComparison.Ordinal)
            || addMessagingBody.Contains("configuration.GetConnectionString(\"RabbitMQ\")", StringComparison.Ordinal)
            || addMessagingBody.Contains("BuildServiceProvider", StringComparison.Ordinal))
        {
            violations.Add("AddMessagingServices must not read Messaging or RabbitMQ connection through raw IConfiguration.");
        }

        if (!addMessagingBody.Contains("MessagingOptions.BindFromConfiguration(messagingOptions, configuration)", StringComparison.Ordinal)
            || !addMessagingBody.Contains("messagingOptions.IsDisabled", StringComparison.Ordinal)
            || !addMessagingBody.Contains("messagingOptions.IsInMemory", StringComparison.Ordinal)
            || !addMessagingBody.Contains("messagingOptions.RabbitMqConnection", StringComparison.Ordinal))
        {
            violations.Add("MassTransit registration must choose transport and RabbitMQ connection from MessagingOptions.");
        }

        if (programSource.Contains("builder.Configuration.GetConnectionString(\"RabbitMQ\")", StringComparison.Ordinal)
            || programSource.Contains("builder.Configuration[\"Messaging:Transport\"]", StringComparison.Ordinal))
        {
            violations.Add("Program.cs RabbitMQ health check must use MessagingOptions rather than raw configuration.");
        }

        violations.Should().BeEmpty("Sprint 5 M3 requires Messaging configuration to flow through validated IOptions<T>");
    }

    [Fact]
    public void M3CacheConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var cacheOptionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/CacheOptions.cs");
        var cacheOptionsSource = File.Exists(cacheOptionsPath) ? File.ReadAllText(cacheOptionsPath) : string.Empty;
        var addCacheBody = ExtractMethodBody(serviceCollectionSource, "AddCacheServices");
        var violations = new List<string>();

        if (!cacheOptionsSource.Contains("public sealed class CacheOptions", StringComparison.Ordinal)
            || !cacheOptionsSource.Contains("RedisConnection", StringComparison.Ordinal)
            || !cacheOptionsSource.Contains("RedisInstanceName", StringComparison.Ordinal)
            || !cacheOptionsSource.Contains("BindFromConfiguration", StringComparison.Ordinal)
            || !cacheOptionsSource.Contains("HasRedisConnection", StringComparison.Ordinal))
        {
            violations.Add("CacheOptions must define Redis connection and instance settings.");
        }

        if (!serviceCollectionSource.Contains("AddOptions<CacheOptions>()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Configure<IConfiguration>(CacheOptions.BindFromConfiguration)", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("AddCacheServices must register CacheOptions with ValidateOnStart.");
        }

        if (addCacheBody.Contains("configuration.GetConnectionString(\"Redis\")", StringComparison.Ordinal)
            || addCacheBody.Contains("BuildServiceProvider", StringComparison.Ordinal))
        {
            violations.Add("AddCacheServices must not read Redis connection through raw IConfiguration.");
        }

        if (!addCacheBody.Contains("CacheOptions.BindFromConfiguration(cacheOptions, configuration)", StringComparison.Ordinal)
            || !addCacheBody.Contains("cacheOptions.HasRedisConnection", StringComparison.Ordinal)
            || !addCacheBody.Contains("cacheOptions.RedisConnection", StringComparison.Ordinal)
            || !addCacheBody.Contains("cacheOptions.RedisInstanceName", StringComparison.Ordinal))
        {
            violations.Add("Cache registration must choose Redis or memory cache from CacheOptions.");
        }

        if (programSource.Contains("builder.Configuration.GetConnectionString(\"Redis\")", StringComparison.Ordinal)
            || !programSource.Contains("CacheOptions.BindFromConfiguration(cacheOptions, builder.Configuration)", StringComparison.Ordinal))
        {
            violations.Add("Program.cs Redis health check must use CacheOptions rather than raw configuration.");
        }

        violations.Should().BeEmpty("Sprint 5 M3 requires Cache configuration to flow through validated IOptions<T>");
    }

    [Fact]
    public void M3SchedulerAgentConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var handlerSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Application/Services/SchedulerAgentEventHandler.cs"));
        var optionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Application/Services/SchedulerAgentOptions.cs");
        var optionsSource = File.Exists(optionsPath) ? File.ReadAllText(optionsPath) : string.Empty;
        var violations = new List<string>();

        if (!optionsSource.Contains("public sealed class SchedulerAgentOptions", StringComparison.Ordinal)
            || !optionsSource.Contains("SectionName", StringComparison.Ordinal)
            || !optionsSource.Contains("EnableSchedulingEventHandler", StringComparison.Ordinal)
            || !optionsSource.Contains("SchedulingEventPollSeconds", StringComparison.Ordinal)
            || !optionsSource.Contains("[Range(15, 3600)]", StringComparison.Ordinal))
        {
            violations.Add("SchedulerAgentOptions must define validated event handler enablement and poll interval settings.");
        }

        if (!programSource.Contains("AddOptions<SchedulerAgentOptions>()", StringComparison.Ordinal)
            || !programSource.Contains(".Bind(builder.Configuration.GetSection(SchedulerAgentOptions.SectionName))", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must register SchedulerAgentOptions with DataAnnotations and ValidateOnStart.");
        }

        if (handlerSource.Contains("IConfiguration", StringComparison.Ordinal)
            || handlerSource.Contains("_configuration", StringComparison.Ordinal)
            || handlerSource.Contains("GetValue", StringComparison.Ordinal)
            || handlerSource.Contains("Agent:EnableSchedulingEventHandler", StringComparison.Ordinal)
            || handlerSource.Contains("Agent:SchedulingEventPollSeconds", StringComparison.Ordinal))
        {
            violations.Add("SchedulerAgentEventHandler must use IOptions<SchedulerAgentOptions> rather than raw IConfiguration.");
        }

        if (!handlerSource.Contains("IOptions<SchedulerAgentOptions>", StringComparison.Ordinal)
            || !handlerSource.Contains("_options.EnableSchedulingEventHandler", StringComparison.Ordinal)
            || !handlerSource.Contains("_options.SchedulingEventPollSeconds", StringComparison.Ordinal))
        {
            violations.Add("SchedulerAgentEventHandler must read enablement and poll interval from SchedulerAgentOptions.");
        }

        violations.Should().BeEmpty("Sprint 5 M3 requires Scheduler Agent configuration to flow through validated IOptions<T>");
    }

    [Fact]
    public void M3QdrantHealthConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var optionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/QdrantHealthOptions.cs");
        var optionsSource = File.Exists(optionsPath) ? File.ReadAllText(optionsPath) : string.Empty;
        var qdrantHealthClassStart = programSource.IndexOf("public sealed class QdrantHealthCheck", StringComparison.Ordinal);
        qdrantHealthClassStart.Should().BeGreaterThanOrEqualTo(0, "QdrantHealthCheck class should exist");
        var qdrantHealthSource = programSource[qdrantHealthClassStart..];
        var violations = new List<string>();

        if (!optionsSource.Contains("public sealed class QdrantHealthOptions", StringComparison.Ordinal)
            || !optionsSource.Contains("SectionName", StringComparison.Ordinal)
            || !optionsSource.Contains("Provider", StringComparison.Ordinal)
            || !optionsSource.Contains("Host", StringComparison.Ordinal)
            || !optionsSource.Contains("Port", StringComparison.Ordinal)
            || !optionsSource.Contains("ApiKey", StringComparison.Ordinal)
            || !optionsSource.Contains("IsQdrantEnabled", StringComparison.Ordinal))
        {
            violations.Add("QdrantHealthOptions must define VectorStore provider and Qdrant endpoint settings.");
        }

        if (!programSource.Contains("AddOptions<QdrantHealthOptions>()", StringComparison.Ordinal)
            || !programSource.Contains(".Bind(builder.Configuration.GetSection(QdrantHealthOptions.SectionName))", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must register QdrantHealthOptions with DataAnnotations and ValidateOnStart.");
        }

        if (qdrantHealthSource.Contains("IConfiguration", StringComparison.Ordinal)
            || qdrantHealthSource.Contains("configuration[", StringComparison.Ordinal)
            || qdrantHealthSource.Contains("configuration.GetValue", StringComparison.Ordinal)
            || qdrantHealthSource.Contains("AI:VectorStore", StringComparison.Ordinal))
        {
            violations.Add("QdrantHealthCheck must use IOptions<QdrantHealthOptions> rather than raw IConfiguration.");
        }

        if (!qdrantHealthSource.Contains("IOptions<QdrantHealthOptions>", StringComparison.Ordinal)
            || !qdrantHealthSource.Contains("_options.IsQdrantEnabled", StringComparison.Ordinal)
            || !qdrantHealthSource.Contains("_options.Host", StringComparison.Ordinal)
            || !qdrantHealthSource.Contains("_options.Port", StringComparison.Ordinal)
            || !qdrantHealthSource.Contains("_options.ApiKey", StringComparison.Ordinal))
        {
            violations.Add("QdrantHealthCheck must read provider, endpoint, and API key from QdrantHealthOptions.");
        }

        violations.Should().BeEmpty("Sprint 5 M3 requires Qdrant health configuration to flow through validated IOptions<T>");
    }

    [Fact]
    public void M3AimesHostConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var optionsPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Configuration/AimesHostOptions.cs");
        var optionsSource = File.Exists(optionsPath) ? File.ReadAllText(optionsPath) : string.Empty;
        var violations = new List<string>();

        if (!optionsSource.Contains("public sealed class AimesHostOptions", StringComparison.Ordinal)
            || !optionsSource.Contains("SectionName", StringComparison.Ordinal)
            || !optionsSource.Contains("TrustForwardedHeaders", StringComparison.Ordinal)
            || !optionsSource.Contains("EnableSwagger", StringComparison.Ordinal)
            || !optionsSource.Contains("DisableHttpsRedirect", StringComparison.Ordinal)
            || !optionsSource.Contains("BindFromConfiguration", StringComparison.Ordinal))
        {
            violations.Add("AimesHostOptions must define host-level Aimes flags.");
        }

        if (!programSource.Contains("AddOptions<AimesHostOptions>()", StringComparison.Ordinal)
            || !programSource.Contains(".Bind(builder.Configuration.GetSection(AimesHostOptions.SectionName))", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateDataAnnotations()", StringComparison.Ordinal)
            || !programSource.Contains(".ValidateOnStart()", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must register AimesHostOptions with DataAnnotations and ValidateOnStart.");
        }

        if (programSource.Contains("builder.Configuration.GetValue<bool>(\"Aimes:", StringComparison.Ordinal)
            || programSource.Contains("builder.Configuration[\"Aimes:", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must not read Aimes host flags through raw IConfiguration.");
        }

        if (programSource.Contains("BuildServiceProvider", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must not build an ad-hoc service provider for Aimes host flags.");
        }

        if (!programSource.Contains("AimesHostOptions.BindFromConfiguration(aimesHostOptions, builder.Configuration)", StringComparison.Ordinal)
            || !programSource.Contains("aimesHostOptions.TrustForwardedHeaders", StringComparison.Ordinal)
            || !programSource.Contains("aimesHostOptions.EnableSwagger", StringComparison.Ordinal)
            || !programSource.Contains("aimesHostOptions.DisableHttpsRedirect", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must read forwarded headers, Swagger, and HTTPS redirect flags from AimesHostOptions.");
        }

        violations.Should().BeEmpty("Sprint 5 M3 requires Aimes host flags to flow through validated IOptions<T>");
    }

    [Fact]
    public void M7TargetEntities_ShouldConfigureConcurrencyTokens()
    {
        var originalProvider = Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER");
        try
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.SqlServer);
            using var db = CreateModelOnlyDbContext();
            var targetTypes = new[]
            {
                typeof(WorkOrder),
                typeof(Equipment),
                typeof(Material),
                typeof(SchedulePlan)
            };

            var violations = targetTypes
                .Select(type => new
                {
                    Type = type,
                    ConcurrencyProperty = db.Model.FindEntityType(type)?
                        .GetProperties()
                        .FirstOrDefault(property => property.IsConcurrencyToken
                            && (property.Name == "version" || property.Name == "Version"))
                })
                .Where(candidate => candidate.ConcurrencyProperty is null)
                .Select(candidate => $"{candidate.Type.Name} missing EF concurrency token")
                .ToList();

            violations.Should().BeEmpty("Sprint 2 M7 requires WorkOrder, Equipment, Material, and SchedulePlan to have EF concurrency tokens");
        }
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", originalProvider);
        }
    }

    [Fact]
    public void Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence()
    {
        var root = FindRepositoryRoot();
        var violations = new List<string>();

        var configurationPaths = new Dictionary<string, string>
        {
            ["WorkOrder"] = Path.Combine(root, "src/backend/MES.Infrastructure/Data/Configurations/WorkOrderConfiguration.cs"),
            ["Equipment"] = Path.Combine(root, "src/backend/MES.Infrastructure/Data/Configurations/EquipmentConfiguration.cs"),
            ["Material"] = Path.Combine(root, "src/backend/MES.Infrastructure/Data/Configurations/MaterialConfiguration.cs"),
            ["SchedulePlan"] = Path.Combine(root, "src/backend/MES.Infrastructure/Data/Configurations/SchedulePlanConfiguration.cs")
        };
        var extensionPath = Path.Combine(root, "src/backend/MES.Infrastructure/Data/Configurations/ConcurrencyConfigurationExtensions.cs");
        var testPath = Path.Combine(root, "src/tests/MES.Tests.Integration/Repositories/ConcurrencyTokenTests.cs");
        var matrixPath = Path.Combine(root, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");

        foreach (var (label, path) in configurationPaths)
        {
            if (!File.Exists(path))
            {
                violations.Add($"{label} configuration file missing.");
                continue;
            }

            var source = File.ReadAllText(path);
            if (!source.Contains("entity.UseProviderShadowConcurrencyToken();", StringComparison.Ordinal))
            {
                violations.Add($"{label} must use provider shadow concurrency token configuration.");
            }
        }

        if (File.Exists(extensionPath))
        {
            var extension = File.ReadAllText(extensionPath);
            foreach (var requiredToken in new[]
            {
                "public static void UseProviderShadowConcurrencyToken<T>",
                "entity.Property<uint>(\"version\")",
                ".HasColumnName(\"xmin\")",
                ".HasColumnType(\"xid\")",
                ".ValueGeneratedOnAddOrUpdate()",
                ".HasColumnName(\"version\")",
                ".HasDefaultValue(0u)",
                ".IsConcurrencyToken()"
            })
            {
                if (!extension.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ConcurrencyConfigurationExtensions missing provider token evidence: {requiredToken}");
                }
            }
        }
        else
        {
            violations.Add("ConcurrencyConfigurationExtensions.cs is required for provider-aware concurrency evidence.");
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "WorkOrder_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "Equipment_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "Material_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "SchedulePlan_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "\"UPDATE work_orders SET updated_at = now() WHERE id = {0}\"",
                "\"UPDATE equipment SET updated_at = now() WHERE id = {0}\"",
                "\"UPDATE materials SET updated_at = now() WHERE id = {0}\"",
                "\"UPDATE schedule_plans SET updated_at = now() WHERE id = {0}\"",
                "ExecuteSqlRawAsync(sql, id)",
                "BumpVersionAsync",
                "ThrowAsync<DbUpdateConcurrencyException>()"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ConcurrencyTokenTests missing direct stale-update evidence token: {requiredToken}");
                }
            }
        }
        else
        {
            violations.Add("ConcurrencyTokenTests.cs is required to prove stale updates fail at SaveChanges.");
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Concurrency tokens configured for WorkOrder/Equipment/Material/SchedulePlan",
                "ConcurrencyTokenTests.WorkOrder_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "ConcurrencyTokenTests.Equipment_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "ConcurrencyTokenTests.Material_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "ConcurrencyTokenTests.SchedulePlan_Update_WithStaleVersion_ShouldThrowConcurrencyException",
                "Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing direct concurrency evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 2 M7 concurrency evidence must prove stale updates fail, not only that EF model metadata contains a token");
    }

    [Fact]
    public void M8ToM10CoreQueries_ShouldHaveCompositeIndexesAndJsonbColumns()
    {
        var originalProvider = Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER");
        try
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.PostgreSql);
            using var db = CreatePostgreSqlModelOnlyDbContext();
            var violations = new List<string>();

            RequireIndex<WorkOrder>(db, violations, nameof(WorkOrder.Status), nameof(WorkOrder.WorkshopId), nameof(WorkOrder.ProductCode), nameof(WorkOrder.PlannedStartDate), nameof(WorkOrder.PlannedEndDate));
            RequireIndex<WorkOrder>(db, violations, nameof(WorkOrder.WorkshopId), nameof(WorkOrder.Priority), nameof(WorkOrder.PlannedStartDate));
            RequireIndex<QualityInspection>(db, violations, nameof(QualityInspection.WorkOrderId), nameof(QualityInspection.InspectedAt));
            RequireIndex<QualityInspection>(db, violations, nameof(QualityInspection.ProductCode), nameof(QualityInspection.InspectedAt));
            RequireIndex<StockTransaction>(db, violations, nameof(StockTransaction.MaterialCode), nameof(StockTransaction.CreatedAt));
            RequireIndex<ScheduleAdoptionFeedback>(db, violations, nameof(ScheduleAdoptionFeedback.CreatedAt));

            RequireJsonb<ScheduleAdoptionFeedback>(db, violations, nameof(ScheduleAdoptionFeedback.OriginalAssignmentsJson));
            RequireJsonb<ScheduleAdoptionFeedback>(db, violations, nameof(ScheduleAdoptionFeedback.ModifiedAssignmentsJson));
            RequireJsonb<ScheduleAdoptionFeedback>(db, violations, nameof(ScheduleAdoptionFeedback.MovedOrderIdsJson));

            violations.Should().BeEmpty("Sprint 2 M8-M10 requires composite indexes for core query shapes and jsonb for JSON payload columns");
        }
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", originalProvider);
        }
    }

    [Fact]
    public void H6ApiV1RouteGroupsExceptAuth_ShouldRequireAuthorization()
    {
        var programSource = File.ReadAllText(Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Program.cs"));
        var routeGroupMatches = Regex.Matches(
            programSource,
            "app\\.MapGroup\\(\"(?<route>/api/v1/[^\"]+)\"\\)(?<chain>.*?)(?=;)",
            RegexOptions.Singleline);

        var violations = routeGroupMatches
            .Select(match => new
            {
                Route = match.Groups["route"].Value,
                Chain = match.Groups["chain"].Value
            })
            .Where(group => !string.Equals(group.Route, "/api/v1/auth", StringComparison.Ordinal))
            .Where(group => !group.Chain.Contains(".RequireAuthorization", StringComparison.Ordinal))
            .Select(group => $"{group.Route}: missing group-level RequireAuthorization")
            .ToList();

        violations.Should().BeEmpty("Sprint 3 H6 requires every non-auth /api/v1 route group to be authenticated by default");
    }

    [Fact]
    public void Sprint3ApiV1Authorization_ShouldHaveDirectAnonymousRejectionCoverage()
    {
        var repositoryRoot = FindRepositoryRoot();
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Security/EndpointAuthorizationTests.cs");
        var violations = new List<string>();

        if (!File.Exists(testPath))
        {
            violations.Add("EndpointAuthorizationTests.cs is required to prove anonymous rejection for non-auth API groups.");
        }
        else
        {
            var source = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "ApiV1EndpointsExceptAuth_ShouldRejectAnonymousRequests",
                "/api/v1/admin/users",
                "/api/v1/anomaly",
                "/api/v1/audit-logs",
                "/api/v1/bom",
                "/api/v1/dashboard",
                "/api/v1/employee",
                "/api/v1/equipment",
                "/api/v1/inventory",
                "/api/v1/knowledge/chat-history/auth-boundary",
                "/api/v1/purchase",
                "/api/v1/quality/inspections",
                "/api/v1/report/dashboard",
                "/api/v1/risk/dashboard",
                "/api/v1/routing",
                "/api/v1/scan/AUTH-BOUNDARY",
                "/api/v1/scheduling/current",
                "HttpStatusCode.Unauthorized"
            })
            {
                if (!source.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Endpoint authorization integration test missing required token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 H6 needs direct anonymous-rejection integration coverage for each non-auth API group, not only a staging probe or two sampled endpoints");
    }

    [Fact]
    public void Sprint1SignalRSubscribeRoleBoundary_ShouldHaveDirectPolicyEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var hubPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Hubs/NotificationHub.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Security/NotificationHubChannelPolicyTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(hubPath))
        {
            violations.Add("NotificationHub.cs is required to enforce SignalR channel subscription policy.");
        }
        else
        {
            var hub = File.ReadAllText(hubPath);
            foreach (var requiredToken in new[]
            {
                "[Authorize]",
                "public async Task Subscribe(string channel)",
                "public async Task Unsubscribe(string channel)",
                "CanSubscribeToChannel(channel, role",
                "ReservedChannels",
                "AllowedPrefixes",
                "ChannelRoles",
                "\"equipment:\"",
                "\"order:\"",
                "\"anomaly:\"",
                "\"quality:\"",
                "\"material:\"",
                "throw new HubException"
            })
            {
                if (!hub.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"NotificationHub.cs missing required SignalR policy token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(testPath))
        {
            violations.Add("NotificationHubChannelPolicyTests.cs is required to prove role/channel allow and reject decisions directly.");
        }
        else
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "CanSubscribe_WhenRoleDoesNotMatchChannel_ShouldReject",
                "CanSubscribe_WhenRoleMatchesChannel_ShouldAllow",
                "NotificationHub.CanSubscribeToChannel",
                "\"Operator\", \"quality:inspection-1\"",
                "\"QC\", \"equipment:cnc-1\"",
                "\"Operator\", \"order:wo-1\"",
                "\"Admin\", \"material:mat-1\"",
                "Should().BeFalse(\"entity channels must be scoped by the caller's role\")",
                "Should().BeTrue()"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"SignalR policy unit test missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite SignalR direct policy evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "SignalR subscribe role boundary enforced",
                "NotificationHubChannelPolicyTests.CanSubscribe_WhenRoleDoesNotMatchChannel_ShouldReject",
                "NotificationHubChannelPolicyTests.CanSubscribe_WhenRoleMatchesChannel_ShouldAllow",
                "Sprint1SignalRSubscribeRoleBoundary_ShouldHaveDirectPolicyEvidence",
                "NotificationHub.CanSubscribeToChannel"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing SignalR direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 SignalR subscribe role boundary needs direct policy tests and an evidence matrix anchor, not only broad Attack Chain support");
    }

    [Fact]
    public void Sprint1RefreshTokens_ShouldHaveDirectHashStorageEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var endpointPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/AuthEndpoints.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AuthControllerTests.cs");
        var configurationPath = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Data/Configurations/RefreshTokenConfiguration.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(endpointPath))
        {
            violations.Add("AuthEndpoints.cs is required to issue, refresh, and revoke hashed refresh tokens.");
        }
        else
        {
            var endpoint = File.ReadAllText(endpointPath);
            foreach (var requiredToken in new[]
            {
                "private static string HashToken(string token)",
                "SHA256.HashData(Encoding.UTF8.GetBytes(token))",
                "Convert.ToBase64String(bytes)",
                "var tokenHash = HashToken(request.RefreshToken)",
                "refreshTokenRepo.GetByTokenAsync(tokenHash, ct)",
                "Token = HashToken(tokenStr)",
                "GenerateRefreshTokenString()",
                "RandomNumberGenerator.GetBytes(32)"
            })
            {
                if (!endpoint.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthEndpoints.cs missing refresh-token hashing token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(configurationPath))
        {
            violations.Add("RefreshTokenConfiguration.cs is required to constrain persisted refresh token hashes.");
        }
        else
        {
            var configuration = File.ReadAllText(configurationPath);
            foreach (var requiredToken in new[]
            {
                "entity.Property(e => e.Token)",
                "IsRequired()",
                "HasMaxLength(128)",
                "entity.HasIndex(e => e.Token).IsUnique()"
            })
            {
                if (!configuration.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"RefreshTokenConfiguration.cs missing persisted hash constraint token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(testPath))
        {
            violations.Add("AuthControllerTests.cs is required to prove refresh token clear text is not persisted.");
        }
        else
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "Login_ShouldPersistOnlyHashedRefreshToken",
                "body!.RefreshToken.Should().NotBeNullOrEmpty()",
                "SHA256.HashData(Encoding.UTF8.GetBytes(body.RefreshToken))",
                "db.RefreshTokens.Where(t => t.Username == \"admin\").Select(t => t.Token).ToList()",
                "storedTokens.Should().Contain(expectedHash",
                "storedTokens.Should().NotContain(body.RefreshToken"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Auth refresh-token integration test missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite direct refresh-token hash storage evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Refresh tokens stored hashed",
                "AuthControllerTests.Login_ShouldPersistOnlyHashedRefreshToken",
                "Sprint1RefreshTokens_ShouldHaveDirectHashStorageEvidence",
                "AuthEndpoints.HashToken",
                "SHA-256"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing refresh-token direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 refresh token storage needs direct hash-storage integration evidence, not only broad Attack Chain B support");
    }

    [Fact]
    public void Sprint1LoginRateLimit_ShouldHaveIpAndUsernamePartitionEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs");
        var middlewarePath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Middleware/AuthRateLimitUsernameMiddleware.cs");
        var partitionKeyPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Services/AuthRateLimitPartitionKey.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Security/AuthRateLimitPartitionKeyTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(programPath))
        {
            violations.Add("Program.cs is required to wire the auth rate limit policy.");
        }
        else
        {
            var program = File.ReadAllText(programPath);
            foreach (var requiredToken in new[]
            {
                "builder.Services.AddRateLimiter",
                "options.AddPolicy<string>(\"Auth\"",
                "AuthRateLimitUsernameMiddleware.UsernameItemKey",
                "AuthRateLimitPartitionKey.Create(",
                "context.Connection.RemoteIpAddress?.ToString()",
                "RateLimitPartition.GetFixedWindowLimiter",
                "PermitLimit = 10",
                "Window = TimeSpan.FromMinutes(1)",
                "app.UseMiddleware<AuthRateLimitUsernameMiddleware>()",
                "app.UseRateLimiter()"
            })
            {
                if (!program.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Program.cs missing auth rate limit partition token: {requiredToken}");
                }
            }

            if (program.IndexOf("app.UseMiddleware<AuthRateLimitUsernameMiddleware>()", StringComparison.Ordinal)
                > program.IndexOf("app.UseRateLimiter()", StringComparison.Ordinal))
            {
                violations.Add("AuthRateLimitUsernameMiddleware must run before UseRateLimiter so username is available for partitioning.");
            }
        }

        if (!File.Exists(middlewarePath))
        {
            violations.Add("AuthRateLimitUsernameMiddleware.cs is required to capture login/change-password usernames before rate limiting.");
        }
        else
        {
            var middleware = File.ReadAllText(middlewarePath);
            foreach (var requiredToken in new[]
            {
                "public const string UsernameItemKey",
                "request.Path.StartsWithSegments(\"/api/v1/auth/login\")",
                "request.Path.StartsWithSegments(\"/api/v1/auth/change-password\")",
                "context.Request.EnableBuffering()",
                "ReadFromJsonAsync<LoginRequestDto>",
                "context.Request.Body.Position = 0"
            })
            {
                if (!middleware.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthRateLimitUsernameMiddleware.cs missing username capture token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(partitionKeyPath))
        {
            violations.Add("AuthRateLimitPartitionKey.cs is required to compose IP and username into one auth rate-limit bucket.");
        }
        else
        {
            var partitionKey = File.ReadAllText(partitionKeyPath);
            foreach (var requiredToken in new[]
            {
                "public static string Create(string? remoteIp, string? username)",
                "remoteIp.Trim()",
                "username.Trim().ToLowerInvariant()",
                "unknown",
                "return $\"{ipPart}|{usernamePart}\""
            })
            {
                if (!partitionKey.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthRateLimitPartitionKey.cs missing partition token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(testPath))
        {
            violations.Add("AuthRateLimitPartitionKeyTests.cs is required to prove IP+username partition behavior.");
        }
        else
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "Create_ShouldIncludeRemoteIpAndUsername",
                "Create_ShouldNormalizeUsername",
                "Create_WhenUsernameMissing_ShouldKeepUnknownBucket",
                "192.0.2.10|admin",
                "192.0.2.10|unknown"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthRateLimitPartitionKeyTests.cs missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite direct login rate-limit partition evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Login rate limit partitioned by IP + username",
                "AuthRateLimitPartitionKeyTests.Create_ShouldIncludeRemoteIpAndUsername",
                "AuthRateLimitPartitionKeyTests.Create_ShouldNormalizeUsername",
                "AuthRateLimitPartitionKeyTests.Create_WhenUsernameMissing_ShouldKeepUnknownBucket",
                "Sprint1LoginRateLimit_ShouldHaveIpAndUsernamePartitionEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing login rate-limit direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 login rate limiting needs direct IP+username partition evidence, not only broad security self-assessment support");
    }

    [Fact]
    public void Sprint1DemoSeeder_ShouldCreateNonEmptyHashedInitialPasswords()
    {
        var repositoryRoot = FindRepositoryRoot();
        var seederPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Services/DatabaseStartupValidator.cs");
        var hasherPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Services/PasswordHasher.cs");
        var userPath = Path.Combine(repositoryRoot, "src/backend/MES.Domain/Entities/Admin/SystemUser.cs");
        var authTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AuthControllerTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(seederPath))
        {
            violations.Add("DatabaseStartupValidator.cs is required to seed demo users through PasswordHasher.");
        }
        else
        {
            var seeder = File.ReadAllText(seederPath);
            foreach (var requiredToken in new[]
            {
                "public sealed class EfDemoDataSeeder",
                "PasswordHasher passwordHasher",
                "passwordHasher.Hash(\"admin123\")",
                "passwordHasher.Hash(\"operator123\")",
                "SystemUser.Create("
            })
            {
                if (!seeder.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"EfDemoDataSeeder missing non-empty password hash token: {requiredToken}");
                }
            }

            if (seeder.Contains("SystemUser.Create(\r\n                \"admin\",\r\n                \"管理员\",\r\n                \"\"", StringComparison.Ordinal)
                || seeder.Contains("SystemUser.Create(\n                \"admin\",\n                \"管理员\",\n                \"\"", StringComparison.Ordinal))
            {
                violations.Add("EfDemoDataSeeder must not seed admin with an empty password hash literal.");
            }
        }

        if (!File.Exists(hasherPath))
        {
            violations.Add("PasswordHasher.cs is required to produce non-empty salted password hashes.");
        }
        else
        {
            var hasher = File.ReadAllText(hasherPath);
            foreach (var requiredToken in new[]
            {
                "Rfc2898DeriveBytes.Pbkdf2",
                "RandomNumberGenerator.GetBytes(SaltSize)",
                "HashAlgorithmName.SHA256",
                "Iterations = 100_000",
                "return $\"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}\""
            })
            {
                if (!hasher.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"PasswordHasher.cs missing salted hash token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(userPath))
        {
            violations.Add("SystemUser.cs is required to reject empty password hashes at creation.");
        }
        else
        {
            var user = File.ReadAllText(userPath);
            foreach (var requiredToken in new[]
            {
                "public static SystemUser Create",
                "ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash)",
                "PasswordHash = passwordHash",
                "MustChangePassword = true"
            })
            {
                if (!user.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"SystemUser.cs missing initial password safety token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(authTestPath))
        {
            violations.Add("AuthControllerTests.cs is required to prove seeded demo credentials authenticate and force rotation.");
        }
        else
        {
            var authTests = File.ReadAllText(authTestPath);
            foreach (var requiredToken in new[]
            {
                "Login_WithValidCredentials_ShouldReturnToken",
                "Password = \"admin123\"",
                "body.MustChangePassword.Should().BeTrue"
            })
            {
                if (!authTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthControllerTests.cs missing seeded login evidence token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite direct seeder password hash evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Seeder does not create empty password hash",
                "EfDemoDataSeeder",
                "PasswordHasher.Hash(\"admin123\")",
                "PasswordHasher.Hash(\"operator123\")",
                "AuthControllerTests.Login_WithValidCredentials_ShouldReturnToken",
                "Sprint1DemoSeeder_ShouldCreateNonEmptyHashedInitialPasswords"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing seeder password hash direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 demo seeding needs direct non-empty password hash evidence, not only broad security self-assessment support");
    }

    [Fact]
    public void Sprint1AdminDefaultPassword_ShouldNotBeAdvertisedAndFirstLoginShouldBeEnforced()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs");
        var middlewarePath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Middleware/PasswordChangeRequiredMiddleware.cs");
        var systemUserTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Domain/SystemUserTests.cs");
        var authTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AuthControllerTests.cs");
        var adminTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AdminControllerTests.cs");
        var migrationPath = Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Data/Migrations/20260530090000_AddSystemUserMustChangePassword.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(programPath))
        {
            violations.Add("Program.cs is required to prove startup does not advertise default credentials.");
        }
        else
        {
            var program = File.ReadAllText(programPath);
            foreach (var forbiddenToken in new[]
            {
                "DefaultAccount",
                "admin / admin123"
            })
            {
                if (program.Contains(forbiddenToken, StringComparison.Ordinal))
                {
                    violations.Add($"Program startup banner must not advertise default credentials: {forbiddenToken}");
                }
            }

            if (!program.Contains("app.UseMiddleware<PasswordChangeRequiredMiddleware>()", StringComparison.Ordinal))
            {
                violations.Add("Program.cs must wire PasswordChangeRequiredMiddleware into the request pipeline.");
            }
        }

        if (!File.Exists(middlewarePath))
        {
            violations.Add("PasswordChangeRequiredMiddleware.cs is required to enforce first-login password rotation.");
        }
        else
        {
            var middleware = File.ReadAllText(middlewarePath);
            foreach (var requiredToken in new[]
            {
                "must_change_password",
                "StatusCodes.Status403Forbidden",
                "/api/v1/auth/change-password",
                "/api/v1/auth/logout",
                "必须先修改初始密码"
            })
            {
                if (!middleware.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"PasswordChangeRequiredMiddleware.cs missing first-login enforcement token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(systemUserTestPath))
        {
            violations.Add("SystemUserTests.cs is required to prove new accounts require initial password rotation.");
        }
        else
        {
            var systemUserTests = File.ReadAllText(systemUserTestPath);
            foreach (var requiredToken in new[]
            {
                "Create_ShouldRequirePasswordChange",
                "ChangePassword_ShouldClearPasswordChangeRequirement"
            })
            {
                if (!systemUserTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"SystemUserTests.cs missing first-login domain token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(authTestPath))
        {
            violations.Add("AuthControllerTests.cs is required to prove seeded login responses expose the rotation requirement.");
        }
        else
        {
            var authTests = File.ReadAllText(authTestPath);
            foreach (var requiredToken in new[]
            {
                "Login_WithValidCredentials_ShouldReturnToken",
                "body.MustChangePassword.Should().BeTrue",
                "ChangePassword_ShouldClearPasswordChangeRequirement",
                "body!.MustChangePassword.Should().BeFalse"
            })
            {
                if (!authTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuthControllerTests.cs missing first-login auth token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(adminTestPath))
        {
            violations.Add("AdminControllerTests.cs is required to prove protected endpoints reject must-change-password users.");
        }
        else
        {
            var adminTests = File.ReadAllText(adminTestPath);
            foreach (var requiredToken in new[]
            {
                "GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden",
                "X-Test-Must-Change-Password",
                "HttpStatusCode.Forbidden",
                "CreateUser_ShouldReturnCreated",
                "result.MustChangePassword.Should().BeTrue"
            })
            {
                if (!adminTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AdminControllerTests.cs missing first-login endpoint token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(migrationPath))
        {
            violations.Add("Must-change-password migration is required to persist first-login rotation state.");
        }
        else
        {
            var migration = File.ReadAllText(migrationPath);
            foreach (var requiredToken in new[]
            {
                "must_change_password",
                "defaultValue: true"
            })
            {
                if (!migration.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Must-change-password migration missing token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite direct admin default-password and first-login evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Admin default password removed and first-login change enforced",
                "Sprint1AdminDefaultPassword_ShouldNotBeAdvertisedAndFirstLoginShouldBeEnforced",
                "PasswordChangeRequiredMiddleware",
                "SystemUserTests.Create_ShouldRequirePasswordChange",
                "AuthControllerTests.ChangePassword_ShouldClearPasswordChangeRequirement",
                "AdminControllerTests.GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing admin default-password/first-login evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 must not advertise default credentials and must directly prove first-login password rotation enforcement");
    }

    [Fact]
    public void Sprint1ChatPanelMarkdownXss_ShouldHaveDirectEscapingEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var componentPath = Path.Combine(repositoryRoot, "src/frontend/src/components/chat/ChatPanel.vue");
        var unitTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/unit/chat-panel.test.ts");
        var e2eTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/e2e/chat.spec.ts");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(componentPath))
        {
            violations.Add("ChatPanel.vue is required to render assistant markdown safely.");
        }
        else
        {
            var component = File.ReadAllText(componentPath);
            foreach (var requiredToken in new[]
            {
                "v-html=\"renderMarkdown(msg.content)\"",
                "function escapeHtml(text: string): string",
                ".replace(/&/g, '&amp;')",
                ".replace(/</g, '&lt;')",
                ".replace(/>/g, '&gt;')",
                ".replace(/\"/g, '&quot;')",
                ".replace(/'/g, '&#39;')",
                ".replace(/\\//g, '&#x2F;')",
                "return escapeHtml(text)",
                ".replace(/```(\\w*)\\n([\\s\\S]*?)```/g, '<pre><code>$2</code></pre>')",
                ".replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')"
            })
            {
                if (!component.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ChatPanel.vue missing safe markdown token: {requiredToken}");
                }
            }

            if (component.Contains("DOMPurify.sanitize", StringComparison.Ordinal)
                || component.Contains("sanitizeHtml", StringComparison.Ordinal))
            {
                violations.Add("ChatPanel markdown evidence must stay anchored to the local escape-first renderer unless a sanitizer migration is explicitly tested and documented.");
            }
        }

        if (!File.Exists(unitTestPath))
        {
            violations.Add("chat-panel.test.ts is required to prove unsafe backend HTML is escaped before v-html rendering.");
        }
        else
        {
            var unitTests = File.ReadAllText(unitTestPath);
            foreach (var requiredToken in new[]
            {
                "escapes unsafe backend HTML before rendering limited markdown",
                "<script>alert(1)</script><img src=x onerror=alert(2)>",
                "expect(html).toContain('<strong>安全摘要</strong>')",
                "expect(html).not.toContain('<script')",
                "expect(html).not.toContain('<img')",
                "expect(assistantContent!.text()).toContain('<script>alert(1)</script>')"
            })
            {
                if (!unitTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ChatPanel unit XSS test missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(e2eTestPath))
        {
            violations.Add("chat.spec.ts is required to prove ChatPanel XSS escaping in real Chrome.");
        }
        else
        {
            var e2eTests = File.ReadAllText(e2eTestPath);
            foreach (var requiredToken in new[]
            {
                "真实浏览器转义后端返回的 unsafe HTML 且只渲染受限 markdown",
                "window.__aimesXss = true",
                "await expect(assistantContent.locator('strong')).toHaveText('安全摘要'",
                "await expect(assistantContent.locator('script')).toHaveCount(0)",
                "await expect(assistantContent.locator('img')).toHaveCount(0)",
                "expect.poll(() => page.evaluate(() => Boolean((window as Window & { __aimesXss?: boolean }).__aimesXss))).toBe(false)"
            })
            {
                if (!e2eTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ChatPanel real Chrome XSS test missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite direct ChatPanel markdown/XSS evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "ChatPanel markdown/XSS escapes unsafe HTML",
                "ChatPanel.vue",
                "chat-panel.test.ts",
                "escapes unsafe backend HTML before rendering limited markdown",
                "chat.spec.ts",
                "真实浏览器转义后端返回的 unsafe HTML 且只渲染受限 markdown",
                "Sprint1ChatPanelMarkdownXss_ShouldHaveDirectEscapingEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing ChatPanel markdown/XSS direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 ChatPanel markdown/XSS needs direct unit and real Chrome evidence, not only broad security self-assessment wording");
    }

    [Fact]
    public void Sprint1AnomalyFrontendDoublePrefix_ShouldHaveDirectRouteEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var anomalyApiPath = Path.Combine(repositoryRoot, "src/frontend/src/api/anomaly.ts");
        var unitTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/unit/anomaly-api.test.ts");
        var e2eTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/e2e/anomaly.spec.ts");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(anomalyApiPath))
        {
            violations.Add("anomaly.ts is required to keep frontend anomaly API paths baseURL-relative.");
        }
        else
        {
            var anomalyApi = File.ReadAllText(anomalyApiPath);
            foreach (var requiredToken in new[]
            {
                "const BASE = '/anomaly'",
                "http.get<PagedResult<ProductionAnomaly>>(BASE",
                "http.get(`${BASE}/critical`)",
                "http.get(`${BASE}/${id}`)",
                "http.post(`${BASE}/${id}/analyze`)"
            })
            {
                if (!anomalyApi.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"anomaly.ts missing baseURL-relative route token: {requiredToken}");
                }
            }

            if (anomalyApi.Contains("'/api/v1/anomaly'", StringComparison.Ordinal)
                || anomalyApi.Contains("\"/api/v1/anomaly\"", StringComparison.Ordinal))
            {
                violations.Add("anomaly.ts must not include /api/v1 in endpoint constants because http.ts already owns that baseURL.");
            }
        }

        if (!File.Exists(unitTestPath))
        {
            violations.Add("anomaly-api.test.ts is required to prove the API wrapper does not pass duplicated prefixes to http.ts.");
        }
        else
        {
            var unitTests = File.ReadAllText(unitTestPath);
            foreach (var requiredToken in new[]
            {
                "uses http baseURL-relative anomaly paths without duplicating api/v1",
                "expect(httpGet).toHaveBeenNthCalledWith(1, '/anomaly'",
                "expect(httpGet).toHaveBeenNthCalledWith(2, '/anomaly/AN-001')",
                "expect(httpPost).toHaveBeenCalledWith('/anomaly/AN-001/analyze')",
                "expect(requestedPaths).not.toContain('/api/v1/anomaly')",
                "!String(path).includes('/api/v1/api/v1/')"
            })
            {
                if (!unitTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"anomaly-api.test.ts missing direct route-prefix token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(e2eTestPath))
        {
            violations.Add("anomaly.spec.ts is required to prove the anomaly page request path in real Chrome.");
        }
        else
        {
            var e2eTests = File.ReadAllText(e2eTestPath);
            foreach (var requiredToken in new[]
            {
                "真实浏览器只请求单层 api/v1 anomaly 路径",
                "const anomalyRequests: string[] = []",
                "page.route('**/api/v1/anomaly**'",
                "localStorage.setItem('aimes_offline_demo', 'false')",
                "double api prefix should not be requested",
                "真实路径异常",
                "expect(anomalyRequests.some(url => url.includes('/api/v1/anomaly'))).toBe(true)",
                "expect(anomalyRequests.every(url => !url.includes('/api/v1/api/v1/'))).toBe(true)"
            })
            {
                if (!e2eTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"anomaly.spec.ts missing real Chrome route-prefix token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite direct anomaly double-prefix evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Anomaly frontend double-prefix bug fixed",
                "anomaly.ts",
                "anomaly-api.test.ts",
                "uses http baseURL-relative anomaly paths without duplicating api/v1",
                "anomaly.spec.ts",
                "真实浏览器只请求单层 api/v1 anomaly 路径",
                "Sprint1AnomalyFrontendDoublePrefix_ShouldHaveDirectRouteEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing anomaly double-prefix direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 1 anomaly double-prefix fix needs direct API wrapper and real Chrome request evidence, not only broad frontend flow evidence");
    }

    [Fact]
    public void Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var e2eTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/e2e/admin.spec.ts");
        var frontendEvidencePath = Path.Combine(repositoryRoot, "_docs/_reports/frontend-real-browser-evidence-20260611.md");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var partialEvidencePath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-partial-evidence-tightening-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { e2eTestPath, frontendEvidencePath, matrixPath, partialEvidencePath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 3 quality gray monitor real-browser evidence.");
            }
        }

        if (File.Exists(e2eTestPath))
        {
            var e2eTests = File.ReadAllText(e2eTestPath);
            foreach (var requiredToken in new[]
            {
                "R3 灰度发布进入 Agent 灰度监控指标",
                "localStorage.setItem('aimes_quality_knowledge_recommendation_feedback'",
                "localStorage.setItem('aimes_quality_knowledge_retraining_versions'",
                "status: 'gray_published'",
                "质量推荐灰度监控",
                ".quality-gray-monitor-card",
                "QK-TRAIN-20260521-R3 灰度监控",
                "推荐采纳率",
                "复验通过率",
                "负样本误召回",
                "AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001",
                "TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED"
            })
            {
                if (!e2eTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"admin.spec.ts missing quality gray monitor real-browser token: {requiredToken}");
                }
            }
        }

        if (File.Exists(frontendEvidencePath))
        {
            var frontendEvidence = File.ReadAllText(frontendEvidencePath);
            foreach (var requiredToken in new[]
            {
                "Targeted Quality Gray Monitor Rerun",
                "npm run test:e2e -- admin.spec.ts -g \"R3 灰度发布进入 Agent 灰度监控指标\"",
                "R3 灰度发布进入 Agent 灰度监控指标",
                "QK-TRAIN-20260521-R3 灰度监控",
                "推荐采纳率 100%",
                "复验通过率 100%",
                "负样本误召回 0 次",
                "AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001",
                "TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED",
                "does not close the first gray release plus 14-day observation gate"
            })
            {
                if (!frontendEvidence.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"frontend real-browser evidence missing quality gray monitor token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Minimum gray observability before first canary",
                "admin.spec.ts",
                "R3 灰度发布进入 Agent 灰度监控指标",
                "Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence",
                "does not close First gray release + 14 days P0/P1=0"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing quality gray monitor real-browser token: {requiredToken}");
                }
            }
        }

        if (File.Exists(partialEvidencePath))
        {
            var partialEvidence = File.ReadAllText(partialEvidencePath);
            foreach (var requiredToken in new[]
            {
                "Quality gray monitoring UI evidence",
                "R3 灰度发布进入 Agent 灰度监控指标",
                "Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence",
                "does not close the release gray observation gate"
            })
            {
                if (!partialEvidence.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Partial evidence report missing quality gray monitor token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 quality gray monitor evidence needs a targeted real Chrome run and explicit release-boundary wording so UI evidence cannot be mistaken for closing the wall-clock gray observation gate");
    }

    [Fact]
    public void H7TargetMutatingEndpoints_ShouldUseAuditEndpointFilter()
    {
        var endpointDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Endpoints");
        var checks = new[]
        {
            new EndpointAuditCheck("AdminEndpoints.cs", "admin", [
                "group.MapPost(\"/users\", CreateUserAsync)",
                "group.MapPut(\"/users/{id}\", UpdateUserAsync)",
                "group.MapPut(\"/configs/{id}\", UpdateConfigAsync)",
                "group.MapPut(\"/notifications/{id}\", UpdateNotificationConfigAsync)"
            ]),
            new EndpointAuditCheck("BomEndpoints.cs", "bom", [
                "group.MapPost(\"/\", CreateAsync)"
            ]),
            new EndpointAuditCheck("InventoryEndpoints.cs", "inventory", [
                "group.MapPost(\"/stock-in\", StockInAsync)",
                "group.MapPost(\"/stock-out\", StockOutAsync)",
                "group.MapPost(\"/transfer\", TransferAsync)",
                "group.MapPost(\"/adjust\", AdjustAsync)"
            ]),
            new EndpointAuditCheck("PurchaseEndpoints.cs", "purchase", [
                "group.MapPost(\"/\", CreateAsync)",
                "group.MapPost(\"/{id}/submit\", SubmitAsync)",
                "group.MapPost(\"/{id}/confirm\", ConfirmAsync)",
                "group.MapPost(\"/{id}/receive\", ReceiveAsync)",
                "group.MapPost(\"/{id}/cancel\", CancelAsync)"
            ]),
            new EndpointAuditCheck("EmployeeEndpoints.cs", "employee", [
                "group.MapPost(\"/\", CreateAsync)",
                "group.MapPut(\"/{id}\", UpdateAsync)",
                "group.MapPost(\"/{id}/deactivate\", DeactivateAsync)"
            ]),
            new EndpointAuditCheck("RoutingEndpoints.cs", "routing", [
                "group.MapPost(\"/\", CreateAsync)"
            ])
        };

        var violations = checks
            .SelectMany(check =>
            {
                var source = File.ReadAllText(Path.Combine(endpointDirectory, check.FileName));
                var failures = new List<string>();
                if (!source.Contains($"AuditEndpointFilter Audit = new(\"{check.Resource}\")", StringComparison.Ordinal))
                {
                    failures.Add($"{check.FileName}: missing AuditEndpointFilter resource '{check.Resource}'");
                }

                foreach (var routeStart in check.RouteStarts)
                {
                    var routeChain = ExtractStatement(source, routeStart);
                    if (!routeChain.Contains(".AddEndpointFilter(Audit)", StringComparison.Ordinal))
                    {
                        failures.Add($"{check.FileName}: {routeStart} missing AddEndpointFilter(Audit)");
                    }
                }

                return failures;
            })
            .ToList();

        violations.Should().BeEmpty("Sprint 3 H7 requires mutating Admin/Bom/Inventory/Purchase/Employee/Routing endpoints to write audit records at the endpoint layer");
    }

    [Fact]
    public void Sprint3TargetMutatingEndpoints_ShouldHaveDirectEndpointAuditEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var employeeTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/EmployeeControllerTests.cs");
        var adminTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AdminControllerTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var partialEvidencePath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-partial-evidence-tightening-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { employeeTestPath, adminTestPath, matrixPath, partialEvidencePath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for direct endpoint audit evidence.");
            }
        }

        if (File.Exists(employeeTestPath))
        {
            var employeeTests = File.ReadAllText(employeeTestPath);
            foreach (var requiredToken in new[]
            {
                "Create_ShouldPersistAuditLogFromEndpointFilter",
                "_client.DefaultRequestHeaders.Add(\"X-Test-User\", \"audit-filter-user\")",
                "db.AuditLogs.Should().Contain(log =>",
                "log.UserId == \"audit-filter-user\"",
                "log.Action == \"POST\"",
                "log.Resource == \"employee\"",
                "log.NewValues.Contains(employeeNumber)"
            })
            {
                if (!employeeTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"EmployeeControllerTests.cs missing direct endpoint audit token: {requiredToken}");
                }
            }
        }

        if (File.Exists(adminTestPath))
        {
            var adminTests = File.ReadAllText(adminTestPath);
            foreach (var requiredToken in new[]
            {
                "CreateUser_ShouldRedactPasswordInAuditLog",
                "log.Resource == \"admin\" && log.Action == \"POST\"",
                "audit.NewValues.Should().Contain(\"***REDACTED***\"",
                "audit.NewValues.Should().NotContain(password"
            })
            {
                if (!adminTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AdminControllerTests.cs missing admin audit endpoint token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Target mutating endpoints use `AuditEndpointFilter`",
                "EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter",
                "AdminControllerTests.CreateUser_ShouldRedactPasswordInAuditLog",
                "Sprint3TargetMutatingEndpoints_ShouldHaveDirectEndpointAuditEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing target mutating endpoint audit token: {requiredToken}");
                }
            }
        }

        if (File.Exists(partialEvidencePath))
        {
            var partialEvidence = File.ReadAllText(partialEvidencePath);
            foreach (var requiredToken in new[]
            {
                "Target mutating endpoint audit evidence",
                "Create_ShouldPersistAuditLogFromEndpointFilter",
                "CreateUser_ShouldRedactPasswordInAuditLog"
            })
            {
                if (!partialEvidence.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Partial evidence report missing target mutating endpoint audit token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 H7 must have direct HTTP endpoint audit persistence evidence in addition to static endpoint filter coverage");
    }

    [Fact]
    public void H9PurchaseStateChangeEndpoints_ShouldUseValidationEndpointFilter()
    {
        var source = File.ReadAllText(Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Endpoints/PurchaseEndpoints.cs"));
        var routeStarts = new[]
        {
            "group.MapPost(\"/{id}/submit\", SubmitAsync)",
            "group.MapPost(\"/{id}/confirm\", ConfirmAsync)",
            "group.MapPost(\"/{id}/cancel\", CancelAsync)"
        };

        var violations = routeStarts
            .Where(routeStart => !ExtractStatement(source, routeStart)
                .Contains(".AddEndpointFilter<ValidationEndpointFilter>()", StringComparison.Ordinal))
            .Select(routeStart => $"PurchaseEndpoints.cs: {routeStart} missing ValidationEndpointFilter")
            .ToList();

        violations.Should().BeEmpty("Sprint 3 H9 requires Purchase submit/confirm/cancel endpoints to pass through the shared validation filter");
    }

    [Fact]
    public void Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var endpointPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/PurchaseEndpoints.cs");
        var filterPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Filters/ValidationEndpointFilter.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/PurchaseControllerTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { endpointPath, filterPath, testPath, matrixPath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 3 Purchase state-change validation evidence.");
            }
        }

        if (File.Exists(endpointPath))
        {
            var endpoint = File.ReadAllText(endpointPath);
            foreach (var routeStart in new[]
            {
                "group.MapPost(\"/{id}/submit\", SubmitAsync)",
                "group.MapPost(\"/{id}/confirm\", ConfirmAsync)",
                "group.MapPost(\"/{id}/cancel\", CancelAsync)"
            })
            {
                var statement = ExtractStatement(endpoint, routeStart);
                if (!statement.Contains(".AddEndpointFilter<ValidationEndpointFilter>()", StringComparison.Ordinal))
                {
                    violations.Add($"PurchaseEndpoints.cs: {routeStart} missing ValidationEndpointFilter.");
                }

                if (!statement.Contains(".AddEndpointFilter(Audit)", StringComparison.Ordinal))
                {
                    violations.Add($"PurchaseEndpoints.cs: {routeStart} missing AuditEndpointFilter.");
                }
            }
        }

        if (File.Exists(filterPath))
        {
            var filter = File.ReadAllText(filterPath);
            foreach (var requiredToken in new[]
            {
                "public sealed class ValidationEndpointFilter : IEndpointFilter",
                "typeof(IValidator<>).MakeGenericType(arg.GetType())",
                "validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted)",
                "TypedResults.ValidationProblem(errors)",
                "return await next(context);"
            })
            {
                if (!filter.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ValidationEndpointFilter missing validation token: {requiredToken}");
                }
            }
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "SubmitAndConfirm_ShouldTransitionStatus",
                "PostAsync($\"/api/v1/purchase/{created!.Id}/submit\", null)",
                "submitted!.Status.Should().Be(\"Submitted\")",
                "PostAsync($\"/api/v1/purchase/{created.Id}/confirm\", null)",
                "confirmed!.Status.Should().Be(\"Confirmed\")",
                "Cancel_ShouldSetCancelled",
                "PostAsync($\"/api/v1/purchase/{created!.Id}/cancel\", null)",
                "result!.Status.Should().Be(\"Cancelled\")"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"PurchaseControllerTests missing state-change evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Purchase submit/confirm/cancel use validation filter",
                "PurchaseEndpoints.cs",
                "ValidationEndpointFilter",
                "SubmitAndConfirm_ShouldTransitionStatus",
                "Cancel_ShouldSetCancelled",
                "Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing Purchase state-change validation evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 Purchase submit/confirm/cancel validation evidence needs endpoint filter tokens, shared filter behavior, integration flow tests, and a matrix anchor");
    }

    [Fact]
    public void H10AllMinimalApiEndpoints_ShouldDeclareTags()
    {
        var endpointDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Endpoints");
        var violations = Directory.GetFiles(endpointDirectory, "*.cs")
            .SelectMany(file =>
            {
                var source = File.ReadAllText(file);
                return Regex.Matches(
                        source,
                        "group\\.Map(?:Get|Post|Put|Patch|Delete)\\(",
                        RegexOptions.Singleline)
                    .Select(match => ExtractStatement(source, match.Index))
                    .Where(statement => !statement.Contains(".WithTags(", StringComparison.Ordinal))
                    .Select(statement => $"{Path.GetFileName(file)}: {FirstLine(statement)} missing WithTags");
            })
            .ToList();

        violations.Should().BeEmpty("Sprint 3 H10 requires every Minimal API endpoint to be tagged for OpenAPI and audit discoverability");
    }

    [Fact]
    public void H4ObsoleteMvcFilters_ShouldNotExistOrBeReferenced()
    {
        var apiRoot = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api");
        var obsoleteFiles = new[]
        {
            "Filters/ValidationFilter.cs",
            "Filters/AuditAttribute.cs"
        };
        var obsoleteTypeNames = new[]
        {
            "ValidationFilter",
            "AuditAttribute"
        };

        var violations = obsoleteFiles
            .Where(file => File.Exists(Path.Combine(apiRoot, file)))
            .Select(file => $"{file}: obsolete MVC filter file should be removed")
            .ToList();

        violations.AddRange(Directory.GetFiles(apiRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.Ordinal)
                && !file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.Ordinal)
                && !file.Contains($"{Path.DirectorySeparatorChar}wwwroot{Path.DirectorySeparatorChar}", StringComparison.Ordinal))
            .SelectMany(file =>
            {
                var source = File.ReadAllText(file);
                return obsoleteTypeNames
                    .Where(typeName => source.Contains(typeName, StringComparison.Ordinal))
                    .Select(typeName => $"{Path.GetRelativePath(apiRoot, file)}: references obsolete {typeName}");
            }));

        violations.Should().BeEmpty("Sprint 3 H4 removes dead MVC filters so Minimal API filters remain the single endpoint cross-cutting path");
    }

    [Fact]
    public void Sprint5DeadIntegrationStubs_ShouldNotRemainRegisteredOrCompiled()
    {
        var repositoryRoot = FindRepositoryRoot();
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var obsoleteFiles = new[]
        {
            "src/backend/MES.Infrastructure/Services/ErpServiceStub.cs",
            "src/backend/MES.Infrastructure/Services/WmsServiceStub.cs",
            "src/backend/MES.Infrastructure/Services/MaterialCallServiceStub.cs",
            "src/backend/MES.Infrastructure/Services/MaterialDeliveryTrackerStub.cs",
            "src/backend/MES.Infrastructure/Services/EquipmentCommandServiceStub.cs",
            "src/backend/MES.Domain/Interfaces/Integration/IErpService.cs",
            "src/backend/MES.Domain/Interfaces/Integration/IWmsService.cs",
            "src/backend/MES.Domain/Interfaces/Integration/IMaterialCallService.cs",
            "src/backend/MES.Domain/Interfaces/Integration/IMaterialDeliveryTracker.cs",
            "src/backend/MES.Domain/Interfaces/Integration/IEquipmentCommandService.cs",
            "src/backend/MES.Domain/Interfaces/Integration/IntegrationDtos.cs"
        };
        var obsoleteTokens = new[]
        {
            "ErpServiceStub",
            "WmsServiceStub",
            "MaterialCallServiceStub",
            "MaterialDeliveryTrackerStub",
            "EquipmentCommandServiceStub",
            "IErpService",
            "IWmsService",
            "IMaterialCallService",
            "IMaterialDeliveryTracker",
            "IEquipmentCommandService",
            "MES.Domain.Interfaces.Integration"
        };

        var violations = obsoleteFiles
            .Where(file => File.Exists(Path.Combine(repositoryRoot, file)))
            .Select(file => $"{file}: unused integration stub/interface should be removed")
            .ToList();

        violations.AddRange(obsoleteTokens
            .Where(token => serviceCollectionSource.Contains(token, StringComparison.Ordinal))
            .Select(token => $"ServiceCollectionExtensions.cs should not register unused integration stub token {token}"));

        violations.Should().BeEmpty("Sprint 5 5.9 removes unused integration stubs so DI only exposes active application dependencies");
    }

    [Fact]
    public void H3AuditEndpointFilter_ShouldDependOnAuditAppServiceNotDbContext()
    {
        var source = File.ReadAllText(Path.Combine(
            FindRepositoryRoot(),
            "src/backend/MES.Api/Filters/AuditEndpointFilter.cs"));
        var forbiddenTokens = new[]
        {
            "MesDbContext",
            "MES.Infrastructure.Data",
            "new AuditLog",
            ".AuditLogs",
            "SaveChangesAsync"
        };

        var violations = forbiddenTokens
            .Where(token => source.Contains(token, StringComparison.Ordinal))
            .Select(token => $"AuditEndpointFilter.cs references persistence detail: {token}")
            .ToList();

        source.Should().Contain("IAuditLogAppService", "Sprint 3 H3 requires endpoint audit writes to flow through the application service boundary");
        source.Should().Contain("IUnitOfWork", "Sprint 3 H3 requires endpoint audit writes to use the shared transaction boundary");
        violations.Should().BeEmpty("Sprint 3 H3 keeps endpoint filters out of direct EF persistence");
    }

    [Fact]
    public void Sprint3AuditEndpointFilterLayering_ShouldHaveDirectUnitEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var filterPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Filters/AuditEndpointFilter.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Filters/AuditEndpointFilterTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var partialEvidencePath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-partial-evidence-tightening-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { filterPath, testPath, matrixPath, partialEvidencePath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for AuditEndpointFilter layering evidence.");
            }
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork",
                "new AuditEndpointFilter(\"employee\")",
                "services.AddSingleton(auditLog.Object)",
                "services.AddSingleton(unitOfWork.Object)",
                "unitOfWork.Verify(u => u.ExecuteAsync(",
                "auditLog.Verify(a => a.WriteAuditLogAsync(",
                "user-123",
                "POST",
                "employee",
                "employee-001"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"AuditEndpointFilterTests.cs missing layering evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "`AuditEndpointFilter` writes through `IAuditLogAppService`, not DbContext",
                "AuditEndpointFilterTests.Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork",
                "H3AuditEndpointFilter_ShouldDependOnAuditAppServiceNotDbContext",
                "Sprint3AuditEndpointFilterLayering_ShouldHaveDirectUnitEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing AuditEndpointFilter layering evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(partialEvidencePath))
        {
            var partialEvidence = File.ReadAllText(partialEvidencePath);
            foreach (var requiredToken in new[]
            {
                "AuditEndpointFilter layering evidence",
                "Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork",
                "IAuditLogAppService",
                "IUnitOfWork"
            })
            {
                if (!partialEvidence.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Partial evidence report missing AuditEndpointFilter layering token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 H3 needs direct unit evidence that AuditEndpointFilter writes through IAuditLogAppService inside IUnitOfWork, not only static no-DbContext scanning");
    }

    [Fact]
    public void Sprint3AuditRedaction_ShouldHaveDirectUnitAndEndpointEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var redactionTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Security/AuditRedactionTests.cs");
        var adminTestPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/AdminControllerTests.cs");
        var filterPath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Filters/AuditEndpointFilter.cs");
        var violations = new List<string>();

        if (!File.Exists(redactionTestPath))
        {
            violations.Add("AuditRedactionTests.cs is required to prove sensitive field masking directly.");
        }
        else
        {
            var redactionTests = File.ReadAllText(redactionTestPath);
            foreach (var requiredToken in new[]
            {
                "RedactAndSerialize_ShouldMaskNestedSensitiveFields",
                "Password",
                "ApiKey",
                "SecretToken",
                "***REDACTED***",
                "Should().NotContain(\"plain-password\")",
                "Should().NotContain(\"api-key-value\")",
                "Should().NotContain(\"secret-token-value\")"
            })
            {
                if (!redactionTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Audit redaction unit test missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(adminTestPath))
        {
            violations.Add("AdminControllerTests.cs is required to prove endpoint audit payload redaction.");
        }
        else
        {
            var adminTests = File.ReadAllText(adminTestPath);
            foreach (var requiredToken in new[]
            {
                "CreateUser_ShouldRedactPasswordInAuditLog",
                "plain-password-",
                "db.AuditLogs",
                "audit.NewValues.Should().Contain(\"***REDACTED***\"",
                "audit.NewValues.Should().NotContain(password"
            })
            {
                if (!adminTests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Admin audit redaction integration test missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(filterPath))
        {
            violations.Add("AuditEndpointFilter.cs is required for endpoint-layer audit redaction.");
        }
        else
        {
            var filter = File.ReadAllText(filterPath);
            if (!filter.Contains("AuditRedaction.RedactAndSerialize", StringComparison.Ordinal))
            {
                violations.Add("AuditEndpointFilter must redact endpoint arguments before writing NewValues.");
            }
        }

        violations.Should().BeEmpty("Sprint 3 sensitive audit fields need direct unit and endpoint evidence, not only a prepared staging probe");
    }

    [Fact]
    public void H21DirectoryBuildProps_ShouldNotSuppressHighSeverityNuGetAuditWarnings()
    {
        var source = File.ReadAllText(Path.Combine(FindRepositoryRoot(), "Directory.Build.props"));

        source.Should().NotContain("NU1903", "Sprint 3 H21 requires high severity NuGet audit warnings to block builds instead of being suppressed");
    }

    [Fact]
    public void H22Dockerfile_ShouldUsePinnedImagesNonRootRuntimeAndCacheFriendlyRestore()
    {
        var repositoryRoot = FindRepositoryRoot();
        var dockerfilePath = Path.Combine(repositoryRoot, "Dockerfile");
        var dockerIgnorePath = Path.Combine(repositoryRoot, ".dockerignore");
        var violations = new List<string>();

        if (!File.Exists(dockerfilePath))
        {
            violations.Add("Dockerfile is missing.");
        }
        else
        {
            var source = File.ReadAllText(dockerfilePath);
            var fromLines = ReadMeaningfulLines(source)
                .Where(line => line.StartsWith("FROM ", StringComparison.Ordinal))
                .ToList();

            violations.AddRange(fromLines
                .Where(line => !line.Contains("@sha256:", StringComparison.Ordinal))
                .Select(line => $"Dockerfile FROM line must pin an image digest: {line}"));

            var restoreIndex = source.IndexOf("dotnet restore", StringComparison.Ordinal);
            var broadCopyIndex = source.IndexOf("COPY . .", StringComparison.Ordinal);
            if (broadCopyIndex >= 0 && (restoreIndex < 0 || broadCopyIndex < restoreIndex))
            {
                violations.Add("Dockerfile must copy project/package metadata and run dotnet restore before broad source COPY.");
            }

            if (!source.Contains("dotnet publish", StringComparison.Ordinal)
                || !source.Contains("--no-restore", StringComparison.Ordinal))
            {
                violations.Add("Dockerfile must publish with --no-restore after the restore layer.");
            }

            var finalStage = ExtractDockerStage(source, "final");
            if (string.IsNullOrWhiteSpace(finalStage))
            {
                violations.Add("Dockerfile final stage is missing.");
            }
            else
            {
                var userLine = ReadMeaningfulLines(finalStage)
                    .FirstOrDefault(line => line.StartsWith("USER ", StringComparison.Ordinal));
                if (userLine is null)
                {
                    violations.Add("Dockerfile final stage must set a non-root USER.");
                }
                else if (userLine.Contains("root", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(userLine, "USER 0", StringComparison.Ordinal))
                {
                    violations.Add($"Dockerfile final stage USER must not be root: {userLine}");
                }
            }
        }

        if (!File.Exists(dockerIgnorePath))
        {
            violations.Add(".dockerignore is missing.");
        }
        else
        {
            var dockerIgnoreLines = ReadMeaningfulLines(File.ReadAllText(dockerIgnorePath))
                .ToHashSet(StringComparer.Ordinal);
            var requiredIgnorePatterns = new[]
            {
                ".git",
                "bin/",
                "obj/",
                "src/frontend/node_modules",
                "src/frontend/output",
                "src/backend/MES.Api/wwwroot"
            };

            violations.AddRange(requiredIgnorePatterns
                .Where(pattern => !dockerIgnoreLines.Contains(pattern))
                .Select(pattern => $".dockerignore missing required pattern: {pattern}"));
        }

        violations.Should().BeEmpty("Sprint 3 H22 requires hardened Docker images, a non-root runtime, cache-friendly restore, and a bounded build context");
    }

    [Fact]
    public void H20GitHubActions_ShouldUseSingleRootCiWorkflowWithRequiredQualityGates()
    {
        var repositoryRoot = FindRepositoryRoot();
        var repositoryCiPath = Path.Combine(repositoryRoot, ".github/workflows/ci.yml");
        var violations = new List<string>();

        if (!File.Exists(repositoryCiPath))
        {
            violations.Add("Repository-root .github/workflows/ci.yml is missing.");
        }
        else
        {
            var source = File.ReadAllText(repositoryCiPath);
            var requiredTokens = new[]
            {
                "dotnet restore",
                "dotnet build",
                "dotnet format",
                "--verify-no-changes",
                "--no-restore",
                "src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj",
                "src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj",
                "src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj",
                "src/frontend",
                "npm ci",
                "npm run lint",
                "npm run build",
                "docker build"
            };

            violations.AddRange(requiredTokens
                .Where(token => !source.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Repository CI missing required gate/token: {token}"));
        }

        violations.Should().BeEmpty("Sprint 3 H20 requires the git repository root GitHub Actions workflow to block merges on quality gates");
    }

    [Fact]
    public void BackendTestEntrypoints_ShouldSkipFrontendStaticCopy()
    {
        var repositoryRoot = FindRepositoryRoot();
        var checks = new[]
        {
            (
                Path.Combine(repositoryRoot, ".github/workflows/ci.yml"),
                new[]
                {
                    "dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true",
                    "dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true",
                    "dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true"
                }
            ),
            (
                Path.Combine(repositoryRoot, ".github/workflows/eval.yml"),
                new[]
                {
                    "dotnet build src/backend/AIMes.slnx --no-restore /p:SkipFrontendBuildCopy=true",
                    "dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-build /p:SkipFrontendBuildCopy=true",
                    "dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj --no-build /p:SkipFrontendBuildCopy=true"
                }
            ),
            (
                Path.Combine(repositoryRoot, "scripts/run-attack-chain-automated-evidence.ps1"),
                new[]
                {
                    "MES.Tests.Integration.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true --filter",
                    "MES.Tests.Unit.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true --filter",
                    "MES.ArchitectureTests.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true --filter"
                }
            ),
            (
                Path.Combine(repositoryRoot, "scripts/run-security-self-assessment.ps1"),
                new[]
                {
                    "MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter",
                    "MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter",
                    "MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter"
                }
            ),
            (
                Path.Combine(repositoryRoot, "scripts/run-employee-production-scheduling-evidence.ps1"),
                new[]
                {
                    "dotnet build-server shutdown",
                    "MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter",
                    "MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter",
                    "FullyQualifiedName~OperationCodeTests",
                    "FullyQualifiedName~OperationServiceTests",
                    "FullyQualifiedName~OperationRepositoryTests",
                    "FullyQualifiedName~SchedulingContextProviderTests",
                    "FullyQualifiedName~ProductionControllerTests"
                }
            )
        };
        var violations = new List<string>();

        foreach (var (path, requiredTokens) in checks)
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is missing.");
                continue;
            }

            var source = File.ReadAllText(path);
            violations.AddRange(requiredTokens
                .Where(token => !source.Contains(token, StringComparison.Ordinal))
                .Select(token => $"{Path.GetRelativePath(repositoryRoot, path)} missing SkipFrontendBuildCopy test token: {token}"));
        }

        violations.Should().BeEmpty("backend test entrypoints should opt out of frontend static copy so test evidence is not blocked by locked wwwroot/scheduling assets");
    }

    [Fact]
    public void FrontendEmployeeOfflineDemoEvidenceEntrypoint_ShouldBeRepeatableAndBounded()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-employee-offline-demo-evidence.ps1");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-employee-offline-demo-evidence.ps1 is required to rerun the Employee offline-demo real-browser evidence.");
        }
        else
        {
            var source = File.ReadAllText(scriptPath);
            foreach (var requiredToken in new[]
            {
                "frontend-real-browser-employee-offline-demo-20260621-current.md",
                "tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts",
                "tests/e2e/employee.spec.ts -g",
                "backend skip",
                "AIMES_E2E_OFFLINE_DEMO",
                "Result: PASS",
                "Result: FAIL",
                "Exit code:"
            })
            {
                if (!source.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"scripts/run-employee-offline-demo-evidence.ps1 missing required token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Employee offline-demo evidence should have one bounded repeatable script instead of relying on manual browser checks");
    }

    [Fact]
    public void PhaseOneMatrix_ShouldCiteEmployeeOfflineDemoRealBrowserEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite Employee offline-demo real-browser evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Employee offline-demo backend skip quiet fallback",
                "scripts/run-employee-offline-demo-evidence.ps1",
                "frontend-real-browser-employee-offline-demo-20260621-current.md",
                "offline-demo-mode.test.ts",
                "employee-board.test.ts",
                "employee.spec.ts",
                "显式离线演示入口展示本地员工且不暴露 backend skip 技术错误",
                "FrontendEmployeeOfflineDemoEvidenceEntrypoint_ShouldBeRepeatableAndBounded"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing Employee offline-demo evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Employee offline-demo real-browser evidence should be part of the Sprint 0 audit matrix, not only a standalone report");
    }

    [Fact]
    public void FrontendEmployeeLiveBackendEvidenceEntrypoint_ShouldBeRepeatableAndBounded()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-employee-live-backend-evidence.ps1");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-employee-live-backend-evidence.ps1 is required to rerun the Employee live-backend recovery evidence.");
        }
        else
        {
            var source = File.ReadAllText(scriptPath);
            foreach (var requiredToken in new[]
            {
                "employee-live-backend-evidence-20260630-5002-current.md",
                "Backend health preflight",
                "tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/nuxt-auth-middleware.test.ts",
                "tests/e2e/employee.spec.ts -g",
                "employee-live-backend",
                "AIMES_E2E_LIVE_BACKEND",
                "AIMES_E2E_OFFLINE_DEMO",
                "VITE_API_TARGET",
                "Result: PASS",
                "Result: FAIL",
                "Exit code:"
            })
            {
                if (!source.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"scripts/run-employee-live-backend-evidence.ps1 missing required token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Employee live-backend recovery evidence should have one bounded repeatable script instead of relying on manual browser checks");
    }

    [Fact]
    public void PhaseOneMatrix_ShouldCiteEmployeeLiveBackendRecoveryEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite Employee live-backend recovery evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Employee live-backend recovery from stale offline-demo state",
                "scripts/run-employee-live-backend-evidence.ps1",
                "employee-live-backend-evidence-20260622-current.md",
                "offline-demo-mode.test.ts",
                "router-auth.test.ts",
                "nuxt-auth-middleware.test.ts",
                "employee.spec.ts",
                "employee-live-backend",
                "/api/v1/employee",
                "aimes_offline_demo=false",
                "FrontendEmployeeLiveBackendEvidenceEntrypoint_ShouldBeRepeatableAndBounded",
                "PhaseOneMatrix_ShouldCiteEmployeeLiveBackendRecoveryEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing Employee live-backend recovery evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Employee live-backend recovery evidence should be discoverable from the Sprint 0 audit matrix, not only a standalone report");
    }

    [Fact]
    public void Sprint0CurrentBaselineIndex_ShouldCiteEmployeeLiveBackendRecoveryEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var indexPath = Path.Combine(repositoryRoot, "_docs/_review/20260622-sprint0-current-baseline-index.md");
        var bridgePath = Path.Combine(repositoryRoot, "_docs/_plan/20260514-cc-remediation-plan.md");
        var violations = new List<string>();

        foreach (var path in new[] { indexPath, bridgePath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is missing.");
                continue;
            }

            var source = File.ReadAllText(path);
            foreach (var requiredToken in new[]
            {
                "employee-live-backend-evidence-20260630-5002-current.md",
                "employee-live-backend",
                "5002",
                "/api/v1/employee"
            })
            {
                if (!source.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} missing Employee live-backend baseline token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 0 baseline index and CC plan bridge should cite the latest Employee live-backend recovery evidence");
    }

    [Fact]
    public void EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath()
    {
        var repositoryRoot = FindRepositoryRoot();
        var componentPath = Path.Combine(repositoryRoot, "src/frontend/src/components/employee/EmployeeBoard.vue");
        var unitTestPath = Path.Combine(repositoryRoot, "src/frontend/tests/unit/employee-board.test.ts");
        var violations = new List<string>();

        if (!File.Exists(componentPath))
        {
            violations.Add("EmployeeBoard.vue is required to render the Employee live-backend recovery action.");
        }
        else
        {
            var component = File.ReadAllText(componentPath);
            foreach (var requiredToken in new[]
            {
                "appAssetPath",
                "liveBackendRecoveryHref",
                ":href=\"liveBackendRecoveryHref\"",
                "login?offlineDemo=0&redirect=/employee?offlineDemo=0"
            })
            {
                if (!component.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"EmployeeBoard.vue missing base-path-safe recovery token: {requiredToken}");
                }
            }

            if (component.Contains("href=\"/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0\"", StringComparison.Ordinal))
            {
                violations.Add("EmployeeBoard.vue must not hardcode the /scheduling recovery href.");
            }
        }

        if (!File.Exists(unitTestPath))
        {
            violations.Add("employee-board.test.ts is required to guard the recovery link base path.");
        }
        else
        {
            var unitTest = File.ReadAllText(unitTestPath);
            foreach (var requiredToken in new[]
            {
                "builds the live backend recovery action from the configured app base path",
                "vi.stubEnv('BASE_URL', '/factory/scheduling/')",
                "/factory/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0",
                "/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0"
            })
            {
                if (!unitTest.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"employee-board.test.ts missing recovery base-path token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Employee live-backend recovery links should follow the configured app base path instead of only working under /scheduling");
    }

    [Fact]
    public void PhaseOneMatrix_ShouldCiteEmployeeProductionSchedulingEvidenceChain()
    {
        var repositoryRoot = FindRepositoryRoot();
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to cite Employee -> Production -> Scheduling evidence-chain proof.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Employee -> Production -> Scheduling backend evidence chain",
                "scripts/run-employee-production-scheduling-evidence.ps1",
                "employee-production-scheduling-evidence-20260621-current.md",
                "OperationCodeTests",
                "OperationServiceTests",
                "OperationRepositoryTests",
                "SchedulingContextProviderTests",
                "ProductionControllerTests",
                "WO-013",
                "PhaseOneMatrix_ShouldCiteEmployeeProductionSchedulingEvidenceChain"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing Employee -> Production -> Scheduling evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Employee -> Production -> Scheduling backend evidence should be discoverable from the phase-one matrix, not only from a standalone script report");
    }

    [Fact]
    public void PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(matrixPath))
        {
            violations.Add("Phase-one acceptance matrix is required to summarize the current release-boundary evidence.");
        }
        else
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "hosted-ci-20260621-v1-head-pass.md",
                "47d65547557a8a6cf035327ae94455a1a1285daf",
                "27848757617",
                "27848757651",
                "staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md",
                "no EF tools/runtime version-skew warning",
                "reschedule plus commitment PostgreSQL persistence probes",
                "attack-chain-verification-20260611-manual-verified.md",
                "20260607-security-signoff.md",
                "release-gate-audit-20260621-v1-head-staging-ef-tools-aligned-deferred-gray.md",
                "release-gate-audit-20260621-v1-head-staging-current-deferred-gray.md",
                "release-gate-audit-20260621-v1-head-deferred-gray-recheck.md",
                "Attack Chain A/B/C manual verification | PASS",
                "Security signoff | PASS",
                "First gray release + 14 days P0/P1=0 | DEFERRED_BY_OWNER",
                "PASS_WITH_DEFERRED_GRAY_OBSERVATION",
                "prevents claiming final strict v1.0.0 PASS"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing current release-boundary evidence token: {requiredToken}");
                }
            }

            foreach (var staleToken in new[]
            {
                "attack-chain-verification-20260611-manual-pending.md` remains FAIL",
                "remains UNSIGNED/FAIL",
                "The aggregate release gate remains FAIL because manual Attack Chain verification"
            })
            {
                if (matrix.Contains(staleToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix still contains stale release-boundary wording: {staleToken}");
                }
            }
        }

        violations.Should().BeEmpty("the phase-one matrix should not contradict the current verified Attack Chain, signed security packet, and deferred-gray release audit");
    }

    [Fact]
    public void WorktreeInventory_ShouldExposeDirtyReviewSurfaceBeforeHostedCiClaims()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/write-worktree-inventory-report.ps1");
        var reportPath = Path.Combine(repositoryRoot, "_docs/_reports/worktree-inventory-20260621-current.md");
        var planPath = Path.Combine(repositoryRoot, "_docs/_plan/20260514-cc-remediation-plan.md");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/write-worktree-inventory-report.ps1 is required to size the dirty worktree before current-head CI claims.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            foreach (var requiredToken in new[]
            {
                "git status --porcelain=v1",
                "DirtyEntries",
                "Bucket Summary",
                "Hosted CI evidence only covers committed heads after push and workflow completion.",
                "Stage or split an intended release-candidate slice before claiming current-head CI coverage."
            })
            {
                if (!script.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Worktree inventory script missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(reportPath))
        {
            violations.Add("_docs/_reports/worktree-inventory-20260621-current.md is required as the latest local dirty worktree inventory.");
        }
        else
        {
            var report = File.ReadAllText(reportPath);
            foreach (var requiredToken in new[]
            {
                "DirtyEntries:",
                "src/frontend",
                "src/backend",
                "src/tests",
                "scripts",
                "Hosted CI evidence only covers committed heads after push and workflow completion.",
                "This report does not prove the dirty worktree"
            })
            {
                if (!report.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Worktree inventory report missing required token: {requiredToken}");
                }
            }
        }

        if (!File.Exists(planPath))
        {
            violations.Add("Repo-local CC plan bridge is required to cite the worktree inventory boundary.");
        }
        else
        {
            var plan = File.ReadAllText(planPath);
            foreach (var requiredToken in new[]
            {
                "worktree-inventory-20260621-current.md",
                "hosted CI evidence covers committed heads only",
                "does not prove the dirty worktree"
            })
            {
                if (!plan.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Repo-local CC plan bridge missing worktree inventory token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("hosted CI evidence must not be confused with uncommitted dirty worktree coverage");
    }

    [Fact]
    public void EfToolManifest_ShouldMatchPinnedEfCoreRuntimeVersion()
    {
        var repositoryRoot = FindRepositoryRoot();
        var toolsPath = Path.Combine(repositoryRoot, "dotnet-tools.json");
        var packagesPath = Path.Combine(repositoryRoot, "Directory.Packages.props");
        var violations = new List<string>();

        if (!File.Exists(toolsPath))
        {
            violations.Add("dotnet-tools.json is required so EF migration tooling is repo-local and repeatable.");
        }

        if (!File.Exists(packagesPath))
        {
            violations.Add("Directory.Packages.props is required to read the pinned EF Core runtime version.");
        }

        if (violations.Count == 0)
        {
            using var tools = JsonDocument.Parse(File.ReadAllText(toolsPath));
            var packages = XDocument.Load(packagesPath);
            var efToolVersion = tools.RootElement
                .GetProperty("tools")
                .GetProperty("dotnet-ef")
                .GetProperty("version")
                .GetString();
            var efCoreVersion = packages
                .Descendants("PackageVersion")
                .FirstOrDefault(element => string.Equals(
                    element.Attribute("Include")?.Value,
                    "Microsoft.EntityFrameworkCore",
                    StringComparison.Ordinal))
                ?.Attribute("Version")
                ?.Value;

            if (string.IsNullOrWhiteSpace(efToolVersion))
            {
                violations.Add("dotnet-tools.json must pin dotnet-ef version.");
            }

            if (string.IsNullOrWhiteSpace(efCoreVersion))
            {
                violations.Add("Directory.Packages.props must pin Microsoft.EntityFrameworkCore version.");
            }

            if (!string.Equals(efToolVersion, efCoreVersion, StringComparison.Ordinal))
            {
                violations.Add($"dotnet-ef version {efToolVersion} must match Microsoft.EntityFrameworkCore version {efCoreVersion}.");
            }
        }

        violations.Should().BeEmpty("staging migrations should not emit EF tools/runtime version skew warnings");
    }

    [Fact]
    public void Sprint0CoreModulePersistence_ShouldHaveRestartRecoveryEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/Controllers/CoreModulePersistenceRecoveryTests.cs");
        var violations = new List<string>();

        if (!File.Exists(testPath))
        {
            violations.Add("Core module persistence restart-recovery integration test is required for Sprint 0 evidence.");
        }
        else
        {
            var source = File.ReadAllText(testPath);
            var requiredTokens = new[]
            {
                "CoreModules_ShouldSurviveApplicationRestartAndRemainQueryable",
                "PersistentPostgreSqlWebApplicationFactory",
                "PostgreSqlIntegrationTestScope.RecreateDatabaseAsync",
                "CreateAnomalyAsync",
                "CreateBomAsync",
                "CreateEmployeeAsync",
                "StockInAsync",
                "CreatePurchaseAsync",
                "await using (var firstHost",
                "await using var secondHost",
                "/api/v1/anomaly/",
                "/api/v1/bom/",
                "/api/v1/employee/",
                "/api/v1/inventory/",
                "/api/v1/purchase/"
            };

            violations.AddRange(requiredTokens
                .Where(token => !source.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Core module restart-recovery test missing required token: {token}"));
        }

        violations.Should().BeEmpty("Sprint 0 persisted core-module evidence must prove data survives a recreated API host, not only static repository wiring");
    }

    [Fact]
    public void HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-hosted-ci-evidence.ps1");
        var reportPath = Path.Combine(repositoryRoot, "_docs/_reports/hosted-ci-20260601.md");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-hosted-ci-evidence.ps1 is required to collect hosted CI run URL/run id evidence.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            var requiredScriptTokens = new[]
            {
                "Hosted CI evidence",
                "RunUrl",
                "RunId",
                "Evidence",
                "job summary",
                "Test-RealEvidence",
                "Evidence cannot be a placeholder",
                "gh run",
                "git ls-remote",
                ".github/workflows/ci.yml",
                ".github/workflows/eval.yml",
                "_docs/_reports",
                "Result: FAIL",
                "cannot close the hosted CI release gate"
            };

            violations.AddRange(requiredScriptTokens
                .Where(token => !script.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Hosted CI evidence script missing required token: {token}"));
        }

        if (!File.Exists(reportPath))
        {
            violations.Add("_docs/_reports/hosted-ci-20260601.md is required to fail loud on missing hosted CI run evidence.");
        }
        else
        {
            var report = File.ReadAllText(reportPath);
            var requiredReportTokens = new[]
            {
                "Status: MISSING_REMOTE_RUN",
                "RunUrl:",
                "RunId:",
                "Evidence:",
                "job summary",
                "Result: FAIL",
                "cannot close the hosted CI release gate"
            };

            violations.AddRange(requiredReportTokens
                .Where(token => !report.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Hosted CI evidence report missing required token: {token}"));
        }

        violations.Should().BeEmpty("hosted CI release gate requires a remote runner run URL, run id, and job summary, not just repository-local workflow files");
    }

    [Fact]
    public void ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql()
    {
        var repositoryRoot = FindRepositoryRoot();
        var sopPath = Path.Combine(repositoryRoot, "_docs/SOP.md");
        var dbReadmePath = Path.Combine(repositoryRoot, "db/README.md");
        var violations = new List<string>();

        var sop = File.ReadAllText(sopPath);
        var dbReadme = File.ReadAllText(dbReadmePath);
        var combined = $"{sop}{Environment.NewLine}{dbReadme}";

        if (sop.Contains("init.sql", StringComparison.Ordinal))
        {
            violations.Add("_docs/SOP.md must not reference removed db/init.sql.");
        }

        if (combined.Contains("自动 MigrateAsync", StringComparison.Ordinal)
            || combined.Contains("含 EF 迁移", StringComparison.Ordinal))
        {
            violations.Add("Release runbooks must not imply Production/API startup automatically runs EF migrations.");
        }

        var requiredTokens = new[]
        {
            "dotnet ef database update",
            "Production 环境不允许 API 启动时自动迁移",
            "pending migration",
            "schema 由 EF Core Migrations 唯一管理"
        };

        violations.AddRange(requiredTokens
            .Where(token => !combined.Contains(token, StringComparison.Ordinal))
            .Select(token => $"Release runbooks missing required migration token: {token}"));

        violations.Should().BeEmpty("release runbooks must preserve the Sprint 0 production migration policy before staging rehearsal");
    }

    [Fact]
    public void StagingRehearsal_ShouldHaveExecutableEvidenceScript()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-staging-rehearsal.ps1");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-staging-rehearsal.ps1 is required to collect PostgreSQL/staging release evidence.");
        }
        else
        {
            var source = File.ReadAllText(scriptPath);
            var requiredTokens = new[]
            {
                "docker compose up -d postgresql redis rabbitmq qdrant",
                "dotnet ef database update",
                "docker compose up -d api",
                "/live",
                "/ready",
                "_docs/_reports",
                "ConnectionStrings__DefaultConnection",
                "ASPNETCORE_ENVIRONMENT",
                "'```text'",
                "'```json'"
            };

            violations.AddRange(requiredTokens
                .Where(token => !source.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Staging rehearsal script missing required token: {token}"));
        }

        violations.Should().BeEmpty("PostgreSQL/staging gate needs a repeatable script that captures migration and health-check evidence");
    }

    [Fact]
    public void StagingRehearsal_ShouldReportActualMigrationConnectionString()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-staging-rehearsal.ps1");
        var source = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "$migrationConnectionString",
            "Migration connection string",
            "$env:ConnectionStrings__DefaultConnection = $migrationConnectionString"
        })
        {
            if (!source.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Staging rehearsal script missing migration connection evidence token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("staging rehearsal evidence must show the actual connection string used by EF migrations, not only the API container connection string");
    }

    [Fact]
    public void StagingRehearsal_ShouldNotMisclassifyCompletedDockerInfoAsTimeout()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-staging-rehearsal.ps1");
        var source = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        if (!source.Contains("[System.Diagnostics.ProcessStartInfo]::new()", StringComparison.Ordinal)
            || !source.Contains("$process.WaitForExit($DockerEngineTimeoutSeconds * 1000)", StringComparison.Ordinal)
            || !source.Contains("$dockerInfoExitCode = $process.ExitCode", StringComparison.Ordinal))
        {
            violations.Add("Docker engine preflight must use a ProcessStartInfo timeout and inspect the real docker info exit code.");
        }

        violations.Should().BeEmpty("staging rehearsal must fail only on real Docker engine failures, not on PowerShell Wait-Process's empty success output");
    }

    [Fact]
    public void SecuritySignoff_ShouldHaveSelfAssessmentScriptAndSignedPacket()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-security-self-assessment.ps1");
        var signoffScriptPath = Path.Combine(repositoryRoot, "scripts/run-security-signoff.ps1");
        var signoffPath = Path.Combine(repositoryRoot, "_docs/_review/20260607-security-signoff.md");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-security-self-assessment.ps1 is required to collect security self-assessment evidence.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            var requiredScriptTokens = new[]
            {
                "MES.Tests.Unit",
                "MES.Tests.Integration",
                "MES.ArchitectureTests",
                "package --vulnerable",
                "--include-transitive",
                "npm audit",
                "_docs/_reports",
                "Security self-assessment"
            };

            violations.AddRange(requiredScriptTokens
                .Where(token => !script.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Security self-assessment script missing required token: {token}"));
        }

        if (!File.Exists(signoffScriptPath))
        {
            violations.Add("scripts/run-security-signoff.ps1 is required to generate the human security signoff packet.");
        }
        else
        {
            var signoffScript = File.ReadAllText(signoffScriptPath);
            var requiredSignoffScriptTokens = new[]
            {
                "Test-EvidenceReportPass",
                "Test-RequiredEvidenceReport",
                "Hosted CI evidence must exist and be PASS before security signoff.",
                "PostgreSQL/staging evidence must exist and be PASS before security signoff.",
                "Security self-assessment evidence must exist and be PASS before security signoff.",
                "Attack Chain automated support evidence must exist and be PASS before security signoff.",
                "Real Chrome frontend evidence must exist and be PASS before security signoff.",
                "Test-AttackChainSectionPass",
                "$hostedCiEvidenceResult",
                "$stagingEvidenceResult",
                "$securitySelfAssessmentResult",
                "$attackChainAutomatedResult",
                "$frontendEvidenceResult",
                "Get-AnchoredLineValues",
                "Manual verification: PASS",
                "Attack Chain A",
                "Attack Chain B",
                "Attack Chain C"
            };

            violations.AddRange(requiredSignoffScriptTokens
                .Where(token => !signoffScript.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Security signoff script missing Attack Chain evidence token: {token}"));

            foreach (var forbiddenToken in new[]
            {
                "Current result: `PASS`",
                "Hosted CI: PASS; latest hosted evidence is",
                "PostgreSQL/staging: PASS; latest real rehearsal evidence is"
            })
            {
                if (signoffScript.Contains(forbiddenToken, StringComparison.Ordinal))
                {
                    violations.Add($"Security signoff script must not hard-code referenced evidence PASS in report output: {forbiddenToken}");
                }
            }
        }

        if (!File.Exists(signoffPath))
        {
            violations.Add("_docs/_review/20260607-security-signoff.md is required to fail loud on the security signoff gate.");
        }
        else
        {
            var signoff = File.ReadAllText(signoffPath);
            var requiredSignoffTokens = new[]
            {
                "Status: SIGNED",
                "Decision: SIGNED",
                "Result: PASS",
                "Attack Chain A",
                "Attack Chain B",
                "Attack Chain C",
                "Signer:",
                "SignedAt:",
                "Evidence:",
                "Attack Chain A/B/C: PASS",
                "Gray observation: FAIL until first gray release"
            };

            violations.AddRange(requiredSignoffTokens
                .Where(token => !signoff.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Security signoff packet missing required token: {token}"));
        }

        violations.Should().BeEmpty("v1.0.0 security signoff must keep an auditable signed packet after the human signer closes it");
    }

    [Fact]
    public void ReleaseHumanActionPacket_ShouldPinSecuritySignoffEvidenceInputs()
    {
        var repositoryRoot = FindRepositoryRoot();
        var packetPath = Path.Combine(repositoryRoot, "_docs/_reports/release-human-action-packet-20260611.md");
        var violations = new List<string>();

        if (!File.Exists(packetPath))
        {
            violations.Add("_docs/_reports/release-human-action-packet-20260611.md is required to guide the remaining human release gates.");
        }
        else
        {
            var packet = File.ReadAllText(packetPath);
            var requiredTokens = new[]
            {
                "scripts/run-security-signoff.ps1",
                "-HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md",
                "-StagingReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md",
                "-SecuritySelfAssessmentPath _docs/_reports/security-self-assessment-20260611-current.md",
                "-AttackChainAutomatedPath _docs/_reports/attack-chain-automated-evidence-20260611-current.md",
                "-AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md",
                "-FrontendEvidencePath _docs/_reports/frontend-real-browser-evidence-20260611.md",
                "scripts/run-gray-incident-review.ps1",
                "-Status REVIEWED",
                "-MonitoringSource",
                "-IncidentQueryEvidence",
                "-Evidence \"_docs/_reports/gray-incident-review-20260611-pass.md\""
            };

            violations.AddRange(requiredTokens
                .Where(token => !packet.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Release human action packet security signoff command missing required pinned evidence input: {token}"));
        }

        violations.Should().BeEmpty("the human security signoff command must pin every machine evidence input instead of relying on script defaults that can drift later");
    }

    [Fact]
    public void GrayObservationEvidenceRequest_ShouldRouteThroughIncidentReviewGenerator()
    {
        var repositoryRoot = FindRepositoryRoot();
        var packetPath = Path.Combine(repositoryRoot, "_docs/_reports/gray-observation-monitoring-evidence-request-20260705.md");
        var violations = new List<string>();

        if (!File.Exists(packetPath))
        {
            violations.Add("_docs/_reports/gray-observation-monitoring-evidence-request-20260705.md is required to request strict gray monitoring evidence.");
        }
        else
        {
            var packet = File.ReadAllText(packetPath);
            var requiredTokens = new[]
            {
                "scripts/run-gray-incident-review.ps1",
                "-Status REVIEWED",
                "-Reviewer",
                "-ReviewedAt",
                "-MonitoringSource",
                "-IncidentQueryEvidence",
                "-P0IncidentCount 0",
                "-P1IncidentCount 0",
                "-Evidence \"_docs/_reports/gray-incident-review-20260705-pass.md\""
            };

            violations.AddRange(requiredTokens
                .Where(token => !packet.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Gray observation evidence request must route strict PASS evidence through incident review generator: {token}"));
        }

        violations.Should().BeEmpty("strict gray evidence requests should produce a reviewed monitoring packet before run-gray-observation can close the gate");
    }

    [Fact]
    public void AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-attack-chain-verification.ps1");
        var reportPath = Path.Combine(repositoryRoot, "_docs/_reports/attack-chain-verification-20260601.md");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-attack-chain-verification.ps1 is required to collect manual Attack Chain A/B/C verification evidence.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            var requiredScriptTokens = new[]
            {
                "Attack Chain A",
                "Attack Chain B",
                "Attack Chain C",
                "Manual verification",
                "Verifier",
                "Verifier cannot be a placeholder.",
                "Evidence",
                "[DateTimeOffset]::Parse",
                "VerifiedAt must be a parseable timestamp",
                "VerifiedAt must not be in the future.",
                "LastIndexOf(\":\")",
                "Result: FAIL",
                "_docs/_reports",
                "cannot close the security signoff release gate"
            };

            violations.AddRange(requiredScriptTokens
                .Where(token => !script.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Attack-chain verification script missing required token: {token}"));
        }

        if (!File.Exists(reportPath))
        {
            violations.Add("_docs/_reports/attack-chain-verification-20260601.md is required to fail loud until Attack Chain A/B/C are manually verified.");
        }
        else
        {
            var report = File.ReadAllText(reportPath);
            var requiredReportTokens = new[]
            {
                "Status: PENDING_MANUAL_VERIFICATION",
                "Attack Chain A",
                "Attack Chain B",
                "Attack Chain C",
                "Result: FAIL",
                "cannot close the security signoff release gate"
            };

            violations.AddRange(requiredReportTokens
                .Where(token => !report.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Attack-chain verification report missing required token: {token}"));
        }

        violations.Should().BeEmpty("security signoff requires manual Attack Chain A/B/C verification evidence before a human signer can close it");
    }

    [Fact]
    public void AttackChainManualVerification_ShouldRejectPlaceholderEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-attack-chain-verification.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-RealEvidence",
            "Evidence cannot be a placeholder",
            "TBD",
            "待补"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Attack-chain verification script missing placeholder evidence rejection token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("manual Attack Chain evidence must be a concrete dated artifact, not a placeholder string");
    }

    [Fact]
    public void AttackChainManualVerification_ShouldRejectMissingRepoEvidenceReferences()
    {
        var repositoryRoot = FindRepositoryRoot();
        var verificationScript = File.ReadAllText(Path.Combine(repositoryRoot, "scripts/run-attack-chain-verification.ps1"));
        var releaseGateScript = File.ReadAllText(Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1"));
        var violations = new List<string>();

        foreach (var (scriptName, script) in new[]
        {
            ("run-attack-chain-verification.ps1", verificationScript),
            ("run-release-gate-audit.ps1", releaseGateScript)
        })
        {
            foreach (var requiredToken in new[]
            {
                "Test-EvidenceReferenceExists",
                "_docs/",
                "output/",
                "Evidence reference does not exist",
                "Split-Path"
            })
            {
                if (!script.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"{scriptName} missing repo evidence reference validation token: {requiredToken}");
                }
            }
        }

        if (!verificationScript.Contains("Test-EvidenceReferenceExists $AttackChainAEvidence", StringComparison.Ordinal)
            || !verificationScript.Contains("Test-EvidenceReferenceExists $AttackChainBEvidence", StringComparison.Ordinal)
            || !verificationScript.Contains("Test-EvidenceReferenceExists $AttackChainCEvidence", StringComparison.Ordinal))
        {
            violations.Add("Attack-chain verification script must validate that each A/B/C repo-local evidence reference exists.");
        }

        if (!releaseGateScript.Contains("Test-EvidenceReferenceExists $_", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must validate that repo-local Attack Chain evidence references still exist when aggregating a PASS report.");
        }

        violations.Should().BeEmpty("Attack Chain evidence that names a repo-local artifact must fail loud when the artifact is missing");
    }

    [Fact]
    public void SecuritySelfAssessment_ShouldFailLoudOnVulnerablePackageOutput()
    {
        var repositoryRoot = FindRepositoryRoot();
        var directoryPackages = File.ReadAllText(Path.Combine(repositoryRoot, "Directory.Packages.props"));
        var script = File.ReadAllText(Path.Combine(repositoryRoot, "scripts/run-security-self-assessment.ps1"));
        var violations = new List<string>();

        if (!directoryPackages.Contains("PackageVersion Include=\"System.IO.Packaging\"", StringComparison.Ordinal)
            || !directoryPackages.Contains("Version=\"8.0.1\"", StringComparison.Ordinal))
        {
            violations.Add("Directory.Packages.props must pin System.IO.Packaging to the non-vulnerable 8.0.1 line.");
        }

        var requiredScriptTokens = new[]
        {
            "Assert-NoVulnerabilityFindings",
            "has vulnerable packages",
            "has the following vulnerable packages",
            "没有易受攻击的包",
            "npm config get registry",
            "--registry=https://registry.npmjs.org/"
        };

        violations.AddRange(requiredScriptTokens
            .Where(token => !script.Contains(token, StringComparison.Ordinal))
            .Select(token => $"Security self-assessment script missing fail-loud token: {token}"));

        if (script.Contains("text.Contains(\"易受攻击的包\"", StringComparison.Ordinal))
        {
            violations.Add("Security self-assessment must not broadly match the Chinese phrase for vulnerable packages because clean output can contain it.");
        }

        if (script.Contains(".Contains(", StringComparison.Ordinal)
            && script.Contains("[StringComparison]::", StringComparison.Ordinal))
        {
            violations.Add("Security self-assessment must use Windows PowerShell-compatible case-insensitive matching instead of String.Contains(value, StringComparison).");
        }

        violations.Should().BeEmpty("security self-assessment must not treat vulnerable package audit output as success");
    }

    [Fact]
    public void Sprint3StateChangingAudit_ShouldBeWrittenInsideBusinessUnitOfWork()
    {
        var serviceDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Application/Services");
        var checks = new[]
        {
            new InlineAuditCheck("PurchaseAppService.cs", "SubmitAsync", "PurchaseSubmit"),
            new InlineAuditCheck("PurchaseAppService.cs", "ConfirmAsync", "PurchaseConfirm"),
            new InlineAuditCheck("PurchaseAppService.cs", "CancelAsync", "PurchaseCancel"),
            new InlineAuditCheck("InventoryAppService.cs", "StockInAsync", "InventoryStockIn"),
            new InlineAuditCheck("InventoryAppService.cs", "StockOutAsync", "InventoryStockOut"),
            new InlineAuditCheck("InventoryAppService.cs", "TransferAsync", "InventoryTransfer"),
            new InlineAuditCheck("InventoryAppService.cs", "AdjustAsync", "InventoryAdjust")
        };

        var violations = checks
            .SelectMany(check =>
            {
                var source = File.ReadAllText(Path.Combine(serviceDirectory, check.FileName));
                var methodBody = ExtractMethodBody(source, check.MethodName);
                var failures = new List<string>();

                if (!source.Contains("IAuditLogAppService", StringComparison.Ordinal))
                {
                    failures.Add($"{check.FileName}: missing IAuditLogAppService dependency for inline business audit");
                }

                if (!methodBody.Contains("_unitOfWork.ExecuteAsync", StringComparison.Ordinal))
                {
                    failures.Add($"{check.FileName}:{check.MethodName}: missing business UnitOfWork boundary");
                }

                if (!source.Contains("_auditLog.WriteAuditLogAsync", StringComparison.Ordinal)
                    || !methodBody.Contains(check.Action, StringComparison.Ordinal))
                {
                    failures.Add($"{check.FileName}:{check.MethodName}: missing inline audit action {check.Action}");
                }

                var unitOfWorkIndex = methodBody.IndexOf("_unitOfWork.ExecuteAsync", StringComparison.Ordinal);
                var auditIndex = methodBody.IndexOf(check.Action, StringComparison.Ordinal);
                if (auditIndex >= 0 && unitOfWorkIndex >= 0 && auditIndex < unitOfWorkIndex)
                {
                    failures.Add($"{check.FileName}:{check.MethodName}: audit must be inside the business UnitOfWork lambda");
                }

                return failures;
            })
            .ToList();

        violations.Should().BeEmpty("Sprint 3 audit layering requires state-changing Purchase and Inventory writes to persist audit records inside the same business transaction");
    }

    [Fact]
    public void AuditLogRepository_ShouldNotSelfCommitSoInlineAuditCanShareBusinessTransaction()
    {
        var source = File.ReadAllText(Path.Combine(
            FindRepositoryRoot(),
            "src/backend/MES.Infrastructure/Repositories/AuditLogRepository.cs"));
        var methodBody = ExtractMethodBody(source, "AddAsync");

        methodBody.Should().NotContain("SaveChangesAsync", "inline audit records must be committed by the surrounding IUnitOfWork transaction");
    }

    [Fact]
    public void Sprint3GrayReleaseObservability_ShouldExposeMinimumProductionTelemetryAndHealthGates()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var apiProjectSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/MES.Api.csproj"));
        var packagesSource = File.ReadAllText(Path.Combine(repositoryRoot, "Directory.Packages.props"));
        var appSettingsSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/appsettings.json"));
        var productionSettingsSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/appsettings.Production.json"));
        var violations = new List<string>();

        var requiredPackages = new[]
        {
            "Serilog.Settings.Configuration",
            "Serilog.Sinks.File",
            "Serilog.Sinks.OpenTelemetry",
            "OpenTelemetry.Instrumentation.EntityFrameworkCore",
            "Npgsql.OpenTelemetry"
        };

        foreach (var packageName in requiredPackages)
        {
            if (!apiProjectSource.Contains($"Include=\"{packageName}\"", StringComparison.Ordinal))
            {
                violations.Add($"MES.Api.csproj missing package reference: {packageName}");
            }

            if (!packagesSource.Contains($"Include=\"{packageName}\"", StringComparison.Ordinal))
            {
                violations.Add($"Directory.Packages.props missing package version: {packageName}");
            }
        }

        var requiredProgramTokens = new[]
        {
            "ReadFrom.Configuration",
            "AddEntityFrameworkCoreInstrumentation",
            "AddNpgsql",
            "AddRabbitMQ",
            "QdrantHealthCheck",
            "MapHealthChecks(\"/live\"",
            "MapHealthChecks(\"/ready\"",
            "MapHealthChecks(\"/startup\""
        };

        violations.AddRange(requiredProgramTokens
            .Where(token => !programSource.Contains(token, StringComparison.Ordinal))
            .Select(token => $"Program.cs missing gray-release observability token: {token}"));

        var requiredConfigurationTokens = new[]
        {
            "Serilog",
            "OpenTelemetry",
            "logs/aimes-.log",
            "OTLP"
        };

        violations.AddRange(requiredConfigurationTokens
            .Where(token => !appSettingsSource.Contains(token, StringComparison.Ordinal)
                && !productionSettingsSource.Contains(token, StringComparison.Ordinal))
            .Select(token => $"appsettings missing observability configuration token: {token}"));

        violations.Should().BeEmpty("Sprint 3 gray release requires minimum observability before first production canary: structured logs, OTLP traces/logs, EF/Npgsql telemetry, and split health endpoints");
    }

    [Fact]
    public void ApiProjectFrontendStaticCopy_ShouldBeSkippableForBackendTestBuilds()
    {
        var repositoryRoot = FindRepositoryRoot();
        var apiProjectSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/MES.Api.csproj"));

        apiProjectSource.Should().Contain("SkipFrontendBuildCopy",
            "backend test builds must be able to avoid deleting or copying frontend static assets that may be locked by local dev servers");
        apiProjectSource.Should().Contain("'$(SkipFrontendBuildCopy)' != 'true'",
            "the frontend copy target should keep default behavior while allowing explicit test builds to opt out");
    }

    [Fact]
    public void TestProjectReferencesToApi_ShouldPropagateFrontendCopyOptOut()
    {
        var repositoryRoot = FindRepositoryRoot();
        var testProjectPaths = Directory.GetFiles(
            Path.Combine(repositoryRoot, "src/tests"),
            "*.csproj",
            SearchOption.AllDirectories);
        var violations = new List<string>();

        foreach (var testProjectPath in testProjectPaths)
        {
            var document = XDocument.Load(testProjectPath);
            var apiReferences = document
                .Descendants("ProjectReference")
                .Where(element => (string?)element.Attribute("Include") is { } include
                    && include.Replace('\\', '/').EndsWith("backend/MES.Api/MES.Api.csproj", StringComparison.OrdinalIgnoreCase));

            foreach (var reference in apiReferences)
            {
                var metadata = reference.Elements()
                    .FirstOrDefault(element => element.Name.LocalName == "SkipFrontendBuildCopy")
                    ?.Value;

                if (!string.Equals(metadata, "true", StringComparison.OrdinalIgnoreCase))
                {
                    violations.Add($"{Path.GetRelativePath(repositoryRoot, testProjectPath)} ProjectReference to MES.Api.csproj must set <SkipFrontendBuildCopy>true</SkipFrontendBuildCopy>.");
                }
            }
        }

        violations.Should().BeEmpty("manual dotnet test runs should not delete or copy frontend static assets through the MES.Api project reference");
    }

    [Fact]
    public void GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-gray-observation.ps1");
        var packetPath = Path.Combine(repositoryRoot, "_docs/_reports/gray-observation-20260601.md");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-gray-observation.ps1 is required to collect first gray release and two-week observation evidence.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            var requiredScriptTokens = new[]
            {
                "Gray observation",
                "NOT_STARTED",
                "OBSERVING",
                "PASS",
                "P0/P1",
                "14",
                "Test-RealEvidence",
                "Test-EvidenceReferenceExists",
                "Test-GrayMonitoringEvidenceReferencePass",
                "Evidence cannot be a placeholder",
                "Evidence reference does not exist",
                "reviewed monitoring or incident-review PASS packet",
                "MonitoringSource",
                "Reviewer",
                "ReviewedAt",
                "Split-Path",
                "Get-AnchoredLineValues",
                "Test-AnchoredReportPass",
                "UNSIGNED",
                "FAIL",
                "Signer",
                "SignedAt",
                "Attack Chain A/B/C",
                "Security signoff must be SIGNED and PASS with signer, SignedAt, evidence, and Attack Chain PASS before gray release starts.",
                "GrayReleaseId cannot be a placeholder.",
                "GrayStartedAt must not be after ObservationStartedAt.",
                "ObservationEndedAt must not be in the future.",
                "_docs/_reports",
                "Result: FAIL"
            };

            violations.AddRange(requiredScriptTokens
                .Where(token => !script.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Gray observation script missing required token: {token}"));
        }

        if (!File.Exists(packetPath))
        {
            violations.Add("_docs/_reports/gray-observation-20260601.md is required to fail loud on the gray/observation release gate.");
        }
        else
        {
            var packet = File.ReadAllText(packetPath);
            var requiredPacketTokens = new[]
            {
                "Status: NOT_STARTED",
                "First gray release",
                "Observation window",
                "P0/P1",
                "Result: FAIL",
                "cannot close the v1.0.0 release gate"
            };

            violations.AddRange(requiredPacketTokens
                .Where(token => !packet.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Gray observation packet missing required token: {token}"));
        }

        violations.Should().BeEmpty("v1.0.0 requires first gray release evidence plus a completed two-week no P0/P1 observation window");
    }

    [Fact]
    public void GrayObservationGate_ShouldFailWhileObservationIsStillRunning()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-gray-observation.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Status -eq \"OBSERVING\"",
            "Gray observation is still running.",
            "ObservationStartedAt is required while gray observation is running.",
            "OBSERVING requires gray start evidence. Evidence cannot be a placeholder.",
            "Result: FAIL"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Gray observation script missing observing fail-loud token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("OBSERVING means the 14-day wall-clock window is not complete and the single evidence packet must not report PASS");
    }

    [Fact]
    public void GrayIncidentReview_ShouldGenerateStrictReviewedMonitoringEvidencePacket()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-gray-incident-review.ps1");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-gray-incident-review.ps1 is required to generate signed gray monitoring or incident-review evidence.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            var requiredTokens = new[]
            {
                "Gray incident review",
                "DRAFT",
                "REVIEWED",
                "PASS",
                "Reviewer",
                "ReviewedAt",
                "MonitoringSource",
                "ObservationStartedAt",
                "ObservationEndedAt",
                "P0/P1 incident counts: P0=$P0IncidentCount; P1=$P1IncidentCount",
                "IncidentQueryEvidence",
                "GrayReleaseId cannot be a placeholder.",
                "Test-RealEvidence",
                "Test-EvidenceReferenceExists",
                "Evidence reference does not exist",
                "ReviewedAt must be a parseable timestamp and must not be in the future.",
                "ObservationEndedAt must be a parseable timestamp and must not be in the future.",
                "Incident review PASS requires an observation window of at least 14 calendar days.",
                "Incident review PASS requires zero P0/P1 incidents during the observation window.",
                "reviewed monitoring or incident-review PASS packet",
                "strict v1.0.0 gray observation gate"
            };

            violations.AddRange(requiredTokens
                .Where(token => !script.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Gray incident review script missing required token: {token}"));
        }

        violations.Should().BeEmpty("strict gray PASS needs a reusable generator for reviewed monitoring evidence instead of free-form hand-written packets");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var reportPath = Path.Combine(repositoryRoot, "_docs/_reports/release-gate-audit-20260611-default-current.md");
        var violations = new List<string>();

        if (!File.Exists(scriptPath))
        {
            violations.Add("scripts/run-release-gate-audit.ps1 is required to aggregate v1.0.0 B-track release gate evidence.");
        }
        else
        {
            var script = File.ReadAllText(scriptPath);
            var requiredScriptTokens = new[]
            {
                "Release gate audit",
                "hosted-ci",
                "hosted-ci-20260611-v1-pass.md",
                "staging-rehearsal",
                "staging-rehearsal-20260611-docker-restored.md",
                "attack-chain-verification",
                "attack-chain-verification-20260611-manual-pending.md",
                "security-signoff",
                "20260607-security-signoff.md",
                "gray-observation",
                "gray-observation-20260607-not-started.md",
                "Evidence packet status",
                "FOUND",
                "MISSING",
                "Result: FAIL",
                "cannot close the v1.0.0 release gate"
            };

            violations.AddRange(requiredScriptTokens
                .Where(token => !script.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Release gate audit script missing required token: {token}"));
        }

        if (!File.Exists(reportPath))
        {
            violations.Add("_docs/_reports/release-gate-audit-20260611-default-current.md is required to summarize all current B-track release blockers.");
        }
        else
        {
            var report = File.ReadAllText(reportPath);
            var requiredReportTokens = new[]
            {
                "Hosted CI",
                "Hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary",
                "PostgreSQL/staging",
                "Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready",
                "Attack Chain A/B/C",
                "VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence",
                "Security signoff",
                "20260607-security-signoff.md",
                "Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS",
                "Gray observation",
                "PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence",
                "Evidence packet status",
                "FOUND",
                "MISSING",
                "Result: FAIL",
                "cannot close the v1.0.0 release gate"
            };

            violations.AddRange(requiredReportTokens
                .Where(token => !report.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Release gate audit report missing required token: {token}"));
        }

        violations.Should().BeEmpty("v1.0.0 release readiness must be audited as a single B-track gate summary, not inferred from scattered local reports");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldOnlyAcceptAnchoredGatePassLines()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        if (script.Contains(".Contains(\"Result: PASS\")", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must not accept any report that merely contains 'Result: PASS' anywhere.");
        }

        foreach (var requiredToken in new[] { "Test-AnchoredReportPass", "^- Result: PASS\\s*$", "^Result: PASS\\s*$" })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing anchored PASS token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("old logs, notes, or historical sections must not be able to spoof a release gate PASS");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldOnlyAcceptAnchoredSecuritySignoffLines()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        if (script.Contains(".Contains(\"Status: SIGNED\")", StringComparison.Ordinal)
            || script.Contains(".Contains(\"Decision: SIGNED\")", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must not accept a security signoff packet that merely contains SIGNED tokens anywhere.");
        }

        foreach (var requiredToken in new[] { "Test-AnchoredSignoffSigned", "^- Status: SIGNED\\s*$", "^Status: SIGNED\\s*$", "^- Decision: SIGNED\\s*$", "^Decision: SIGNED\\s*$" })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing anchored security signoff token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("draft notes or examples must not be able to spoof a human security signoff");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequireAttackChainHumanEvidenceFields()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-AttackChainEvidencePass",
            "Status: VERIFIED",
            "Verifier",
            "VerifiedAt",
            "[DateTimeOffset]::Parse",
            "VerifiedAt must not be in the future.",
            "UtcNow",
            "Manual verification: PASS",
            "Evidence",
            "Attack Chain A/B/C",
            "Test-RealEvidence",
            "Evidence cannot be a placeholder",
            "VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing Attack Chain evidence token: {requiredToken}");
            }
        }

        if (!script.Contains("Test-AttackChainEvidencePass $attackChain", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must use the Attack Chain-specific evidence predicate instead of generic Result: PASS only.");
        }

        if (!script.Contains("Get-AnchoredLineValues $lines \"Verifier\" | Where-Object { Test-RealEvidence $_ }", StringComparison.Ordinal)
            || !script.Contains("Get-AnchoredLineValues $lines \"Evidence\" | Where-Object { Test-RealEvidence $_ }", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must reject placeholder verifier and evidence values in Attack Chain reports.");
        }

        violations.Should().BeEmpty("Attack Chain A/B/C cannot close from Result: PASS unless human verifier, timestamp, and per-chain evidence are also present");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequirePerAttackChainSectionEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-AttackChainSectionPass",
            "## Attack Chain A",
            "## Attack Chain B",
            "## Attack Chain C",
            "Manual verification: PASS",
            "Evidence"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing per-chain evidence token: {requiredToken}");
            }
        }

        foreach (var chainName in new[] { "Attack Chain A", "Attack Chain B", "Attack Chain C" })
        {
            if (!script.Contains($"Test-AttackChainSectionPass $Text \"{chainName}\"", StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit must validate the {chainName} section independently.");
            }
        }

        violations.Should().BeEmpty("Attack Chain cannot close by counting any three PASS/evidence lines; A, B, and C each need their own section PASS and evidence");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-SecuritySignoffEvidencePass",
            "Status: SIGNED",
            "Decision: SIGNED",
            "Signer",
            "SignedAt",
            "[DateTimeOffset]::Parse",
            "SignedAt must not be in the future.",
            "violations.Add($futureSignedAtMessage)",
            "UtcNow",
            "Automated Self-Assessment",
            "Attack Chain A/B/C",
            "Evidence",
            "Test-RealEvidence",
            "Evidence cannot be a placeholder",
            "Test-NoBlockingSecuritySignoffText",
            "Test-NoBlockingSecuritySignoffText $Text",
            "Current status",
            "Current result",
            "PENDING_MANUAL_VERIFICATION",
            "PENDING",
            "UNSIGNED",
            "FAIL",
            "Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing security signoff evidence token: {requiredToken}");
            }
        }

        if (!script.Contains("Test-SecuritySignoffEvidencePass $securitySignoff", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must use the security-signoff-specific evidence predicate instead of anchored SIGNED lines only.");
        }

        if (script.Contains("$Text -match '\\b(PENDING|UNSIGNED|FAIL)\\b'", StringComparison.Ordinal)
            || script.Contains("$Text -match \"\\b(PENDING|UNSIGNED|FAIL)\\b\"", StringComparison.Ordinal))
        {
            violations.Add("Security signoff predicate must not reject unrelated FAIL text from independent gates such as Gray observation.");
        }

        if (!script.Contains("Get-AnchoredLineValues $lines \"Current status\"", StringComparison.Ordinal)
            || !script.Contains("Get-AnchoredLineValues $lines \"Current result\"", StringComparison.Ordinal))
        {
            violations.Add("Security signoff predicate must scope blocking text to anchored signoff and Attack Chain status/result fields.");
        }

        violations.Should().BeEmpty("security signoff cannot close from SIGNED lines unless signer, signed timestamp, self-assessment, Attack Chain, and evidence fields are also present");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequireStagingRehearsalEvidenceFields()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-StagingEvidencePass",
            "ASPNETCORE_ENVIRONMENT: Production",
            "ConnectionStrings__DefaultConnection",
            "Docker version",
            "Start external dependencies",
            "Apply EF migrations",
            "Start API",
            "Health /live",
            "Health /ready",
            "Exit code: 0",
            "Test-SectionExitCodeZero",
            "Test-SectionExitCodeZero $Text \"Docker version\"",
            "Test-SectionExitCodeZero $Text \"Start external dependencies\"",
            "Test-SectionExitCodeZero $Text \"Apply EF migrations\"",
            "Test-SectionExitCodeZero $Text \"Start API\"",
            "Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing staging evidence token: {requiredToken}");
            }
        }

        if (!script.Contains("Test-StagingEvidencePass $staging", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must use the staging-specific evidence predicate instead of generic Result: PASS only.");
        }

        violations.Should().BeEmpty("PostgreSQL/staging cannot close from Result: PASS unless migration and health-check evidence are also present");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequireStagingHealthHttpSuccessEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-StagingHealthEndpointPass",
            "Health /live",
            "Health /ready",
            "HTTP 2",
            "HTTP 3"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing staging health success token: {requiredToken}");
            }
        }

        if (!script.Contains("Test-StagingHealthEndpointPass $Text \"/live\"", StringComparison.Ordinal)
            || !script.Contains("Test-StagingHealthEndpointPass $Text \"/ready\"", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must require HTTP success evidence for both /live and /ready staging health endpoints.");
        }

        violations.Should().BeEmpty("staging cannot close from Health /live and Health /ready labels unless each section includes an HTTP 2xx/3xx success result");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-HostedCiEvidencePass",
            "Status: READY_FOR_RELEASE_REVIEW",
            "Repository",
            "zenweb/AIMes",
            "Branch",
            "V1",
            "RunUrl",
            "RunId",
            "Evidence",
            "job summary",
            "Test-RealEvidence",
            "Evidence cannot be a placeholder",
            ".github/workflows/ci.yml: True",
            ".github/workflows/eval.yml: True",
            "gh run",
            "Exit code: 0",
            "Test-SectionExitCodeZero",
            "Test-SectionExitCodeZero $Text \"gh run\"",
            "Test-SectionContainsNumberToken",
            "Test-SectionContainsNumberToken $Text \"gh run\" $runId",
            "release repository, release branch, head SHA"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing hosted CI evidence token: {requiredToken}");
            }
        }

        if (!script.Contains("Test-HostedCiEvidencePass $hostedCi", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must use the hosted CI-specific evidence predicate instead of generic Result: PASS only.");
        }

        if (!script.Contains("Get-AnchoredLineValues $lines \"Evidence\" | Where-Object { Test-RealEvidence $_ -and $_ -match 'job summary' }", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must reject placeholder hosted CI job summary evidence.");
        }

        violations.Should().BeEmpty("Hosted CI cannot close from Result: PASS unless remote run URL, run id, job summary, workflow files, and gh run evidence are also present");
    }

    [Fact]
    public void HostedCiEvidence_ShouldRequireReleaseRepositoryAndBranch()
    {
        var repositoryRoot = FindRepositoryRoot();
        var evidenceScriptPath = Path.Combine(repositoryRoot, "scripts/run-hosted-ci-evidence.ps1");
        var releaseGateScriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var evidenceScript = File.ReadAllText(evidenceScriptPath);
        var releaseGateScript = File.ReadAllText(releaseGateScriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "[string]$Repository = \"zenweb/AIMes\"",
            "[string]$Branch = \"V1\"",
            "Repository: $Repository",
            "Branch: $Branch",
            "Hosted CI run must be for the release repository.",
            "Hosted CI run must be for the V1 release branch."
        })
        {
            if (!evidenceScript.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Hosted CI evidence script missing repository/branch token: {requiredToken}");
            }
        }

        foreach (var requiredToken in new[]
        {
            "Get-AnchoredLineValues $lines \"Repository\"",
            "Get-AnchoredLineValues $lines \"Branch\"",
            "zenweb/AIMes",
            "V1",
            "$hasReleaseRepository",
            "$hasReleaseBranch"
        })
        {
            if (!releaseGateScript.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing hosted CI repository/branch validation token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("hosted CI evidence for v1.0.0 must prove the GitHub Actions run belongs to zenweb/AIMes on the V1 release branch");
    }

    [Fact]
    public void HostedCiEvidence_ShouldBindRunToReleaseHeadSha()
    {
        var repositoryRoot = FindRepositoryRoot();
        var evidenceScriptPath = Path.Combine(repositoryRoot, "scripts/run-hosted-ci-evidence.ps1");
        var releaseGateScriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var evidenceScript = File.ReadAllText(evidenceScriptPath);
        var releaseGateScript = File.ReadAllText(releaseGateScriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "[string]$CommitSha = \"\"",
            "CommitSha is required to close the hosted CI release gate.",
            "Hosted CI run headSha must match CommitSha.",
            "HeadSha: $CommitSha",
            "\"headSha\"",
            "$ghRunViewText.Contains"
        })
        {
            if (!evidenceScript.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Hosted CI evidence script missing head SHA binding token: {requiredToken}");
            }
        }

        foreach (var requiredToken in new[]
        {
            "Get-AnchoredLineValues $lines \"CommitSha\"",
            "Get-AnchoredLineValues $lines \"HeadSha\"",
            "$hasCommitSha",
            "$hasMatchingHeadSha",
            "^[0-9a-fA-F]{40}$"
        })
        {
            if (!releaseGateScript.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing hosted CI head SHA validation token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("hosted CI evidence cannot close from an old successful run unless the run head SHA matches the release commit SHA");
    }

    [Fact]
    public void HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId()
    {
        var repositoryRoot = FindRepositoryRoot();
        var evidenceScriptPath = Path.Combine(repositoryRoot, "scripts/run-hosted-ci-evidence.ps1");
        var releaseGateScriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var evidenceScript = File.ReadAllText(evidenceScriptPath);
        var releaseGateScript = File.ReadAllText(releaseGateScriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-GitHubActionsRunUrl",
            "github.com/.+/actions/runs/",
            "github.com/.+/actions/runs/\\d+$",
            "Test-NumericRunId",
            "Test-GitHubActionsRunUrlMatchesRunId",
            "RunUrl run id must match RunId",
            "RunUrl must be a GitHub Actions run URL",
            "RunId must be numeric"
        })
        {
            if (!evidenceScript.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Hosted CI evidence script missing RunUrl/RunId validation token: {requiredToken}");
            }
        }

        foreach (var requiredToken in new[]
        {
            "Test-GitHubActionsRunUrl",
            "Test-NumericRunId",
            "Test-GitHubActionsRunUrlMatchesRunId",
            "RunUrl",
            "RunId"
        })
        {
            if (!releaseGateScript.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing hosted CI RunUrl/RunId validation token: {requiredToken}");
            }
        }

        violations.Should().BeEmpty("hosted CI evidence cannot close from arbitrary non-empty RunUrl or RunId values");
    }

    [Fact]
    public void HostedCiEvidence_ShouldRequireGhRunListSuccessEvenWhenRunFieldsAreSupplied()
    {
        var repositoryRoot = FindRepositoryRoot();
        var evidenceScriptPath = Path.Combine(repositoryRoot, "scripts/run-hosted-ci-evidence.ps1");
        var evidenceScript = File.ReadAllText(evidenceScriptPath);
        var violations = new List<string>();

        if (!evidenceScript.Contains("gh run list must succeed in the authorized hosted CI evidence environment.", StringComparison.Ordinal))
        {
            violations.Add("Hosted CI evidence script must fail loud when gh run list cannot be queried.");
        }

        if (!evidenceScript.Contains("Test-TextContainsNumberToken", StringComparison.Ordinal)
            || !evidenceScript.Contains("gh run list output must include RunId.", StringComparison.Ordinal))
        {
            violations.Add("Hosted CI evidence script must fail loud when gh run list output does not include the supplied RunId.");
        }

        if (evidenceScript.Contains("$ghRun.ExitCode -ne 0 -and -not (Test-HasValue $RunUrl)", StringComparison.Ordinal))
        {
            violations.Add("Hosted CI evidence script must not allow supplied RunUrl to bypass failed gh run evidence.");
        }

        violations.Should().BeEmpty("hosted CI evidence must prove the local evidence collector can query GitHub Actions, not only accept manually supplied URL fields");
    }

    [Fact]
    public void ReleaseGateAudit_ShouldRequireGrayObservationWindowEvidenceFields()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var script = File.ReadAllText(scriptPath);
        var violations = new List<string>();

        foreach (var requiredToken in new[]
        {
            "Test-GrayObservationEvidencePass",
            "Status: PASS",
            "GrayReleaseId",
            "Get-AnchoredLineValues $lines \"GrayReleaseId\" | Where-Object { Test-RealEvidence $_ }",
            "GrayStartedAt",
            "ObservationStartedAt",
            "ObservationEndedAt",
            "[DateTimeOffset]::Parse",
            "14 calendar days",
            "P0/P1 incident counts: P0=0; P1=0",
            "Test-AnchoredLiteralLine $lines \"P0/P1 incident counts: P0=0; P1=0\"",
            "Evidence",
            "Test-RealEvidence",
            "Test-EvidenceReferenceExists",
            "Test-GrayMonitoringEvidenceReferencePass",
            "Evidence cannot be a placeholder",
            "Evidence reference does not exist",
            "reviewed monitoring or incident-review PASS packet",
            "MonitoringSource",
            "Reviewer",
            "ReviewedAt",
            "GrayStartedAt must not be after ObservationStartedAt.",
            "ObservationEndedAt must not be in the future.",
            "UtcNow",
            "PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence"
        })
        {
            if (!script.Contains(requiredToken, StringComparison.Ordinal))
            {
                violations.Add($"Release gate audit script missing gray observation evidence token: {requiredToken}");
            }
        }

        if (!script.Contains("Test-GrayObservationEvidencePass $grayObservation", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must use the gray-observation-specific evidence predicate instead of generic Result: PASS only.");
        }

        if (!script.Contains("Get-AnchoredLineValues $lines \"Evidence\"", StringComparison.Ordinal)
            || !script.Contains("Test-EvidenceReferenceExists $_", StringComparison.Ordinal)
            || !script.Contains("Test-GrayMonitoringEvidenceReferencePass $_", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must reject placeholder gray observation evidence, missing repo-local evidence references, and repo-local references that are not reviewed monitoring evidence.");
        }

        violations.Should().BeEmpty("Gray observation cannot close from Result: PASS unless first gray release, 14-day window, zero P0/P1, and evidence fields are also present");
    }

    [Fact]
    public void H15OutboundHttp_ShouldUseNamedFactoryClientsWithStandardResilience()
    {
        var repositoryRoot = FindRepositoryRoot();
        var packagesSource = File.ReadAllText(Path.Combine(repositoryRoot, "Directory.Packages.props"));
        var apiProjectSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/MES.Api.csproj"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var llmGatewaySource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/LlmGatewayService.cs"));
        var violations = new List<string>();

        if (!packagesSource.Contains("Include=\"Microsoft.Extensions.Http.Resilience\"", StringComparison.Ordinal))
        {
            violations.Add("Directory.Packages.props missing Microsoft.Extensions.Http.Resilience package version.");
        }

        if (!apiProjectSource.Contains("Include=\"Microsoft.Extensions.Http.Resilience\"", StringComparison.Ordinal))
        {
            violations.Add("MES.Api.csproj missing Microsoft.Extensions.Http.Resilience package reference.");
        }

        foreach (var clientName in new[] { "azure-openai", "openai", "ollama", "qdrant-health" })
        {
            var registrationToken = $"AddHttpClient(\"{clientName}\"";
            if (!serviceCollectionSource.Contains(registrationToken, StringComparison.Ordinal))
            {
                violations.Add($"AddAIServices missing named HTTP client registration: {clientName}.");
            }
            else
            {
                var resilientNamedClientPattern =
                    $@"AddHttpClient\(""{Regex.Escape(clientName)}""[\s\S]*?\.AddStandardResilienceHandler\(\);";
                if (!Regex.IsMatch(serviceCollectionSource, resilientNamedClientPattern))
                {
                    violations.Add($"Named HTTP client {clientName} missing AddStandardResilienceHandler.");
                }
            }
        }

        if (serviceCollectionSource.Contains("services.AddHttpClient();", StringComparison.Ordinal))
        {
            violations.Add("AddAIServices must not leave a bare unnamed AddHttpClient registration for critical outbound dependencies.");
        }

        if (!llmGatewaySource.Contains("CreateClient(\"ollama\")", StringComparison.Ordinal)
            || llmGatewaySource.Contains("CreateClient()", StringComparison.Ordinal))
        {
            violations.Add("LlmGatewayService must use the named ollama HttpClientFactory client.");
        }

        var buildKernelBody = ExtractMethodBody(llmGatewaySource, "BuildKernel");
        foreach (var methodName in new[]
        {
            "AddAzureOpenAIChatCompletion",
            "AddAzureOpenAIEmbeddingGenerator",
            "AddOpenAIChatCompletion",
            "AddOpenAIEmbeddingGenerator"
        })
        {
            if (!buildKernelBody.Contains($"{methodName}(", StringComparison.Ordinal))
            {
                continue;
            }

            var methodIndex = 0;
            while ((methodIndex = buildKernelBody.IndexOf($"{methodName}(", methodIndex, StringComparison.Ordinal)) >= 0)
            {
                var invocation = ExtractInvocation(buildKernelBody, methodIndex);
                if (!invocation.Contains("httpClient", StringComparison.Ordinal)
                    && !invocation.Contains("CreateOpenAIClient", StringComparison.Ordinal))
                {
                    violations.Add($"LlmGatewayService.{methodName} must pass an IHttpClientFactory-created HttpClient into Semantic Kernel.");
                }

                methodIndex += methodName.Length;
            }
        }

        var qdrantHealthClassStart = programSource.IndexOf("public sealed class QdrantHealthCheck", StringComparison.Ordinal);
        qdrantHealthClassStart.Should().BeGreaterThanOrEqualTo(0, "QdrantHealthCheck class should exist");
        var qdrantHealthSource = programSource[qdrantHealthClassStart..];
        if (!qdrantHealthSource.Contains("IHttpClientFactory", StringComparison.Ordinal))
        {
            violations.Add("QdrantHealthCheck must receive IHttpClientFactory through constructor injection.");
        }

        if (!qdrantHealthSource.Contains("CreateClient(\"qdrant-health\")", StringComparison.Ordinal))
        {
            violations.Add("QdrantHealthCheck must use the named qdrant-health HttpClientFactory client.");
        }

        if (qdrantHealthSource.Contains("new HttpClient", StringComparison.Ordinal))
        {
            violations.Add("QdrantHealthCheck must not instantiate HttpClient directly.");
        }

        violations.Should().BeEmpty("Sprint 4 H15 requires critical outbound HTTP calls to use IHttpClientFactory named clients with standard resilience policies");
    }

    [Fact]
    public void Sprint4LlmCostControls_ShouldUseGlobalConcurrencyGateAndSchedulingPromptBudget()
    {
        var repositoryRoot = FindRepositoryRoot();
        var aiProjectSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/MES.AI.csproj"));
        var llmConfigSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Configuration/LlmConfig.cs"));
        var llmGatewaySource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/LlmGatewayService.cs"));
        var concurrencyGateSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/LlmConcurrencyGate.cs"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var schedulingAgentSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Agents/SchedulingAgent.cs"));
        var promptBudgetSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/AiPromptBudget.cs"));
        var violations = new List<string>();

        if (!llmConfigSource.Contains("MaxConcurrency", StringComparison.Ordinal)
            || !llmConfigSource.Contains("[Range(1, 32)]", StringComparison.Ordinal))
        {
            violations.Add("LlmConfig must expose a validated MaxConcurrency setting.");
        }

        if (!concurrencyGateSource.Contains("SemaphoreSlim", StringComparison.Ordinal)
            || !concurrencyGateSource.Contains("WaitAsync(ct)", StringComparison.Ordinal)
            || !concurrencyGateSource.Contains("_semaphore.Release()", StringComparison.Ordinal))
        {
            violations.Add("LlmConcurrencyGate must queue through SemaphoreSlim and release permits in a finally block.");
        }

        if (!llmGatewaySource.Contains("ILlmConcurrencyGate", StringComparison.Ordinal))
        {
            violations.Add("LlmGatewayService must depend on ILlmConcurrencyGate.");
        }

        foreach (var methodName in new[] { "GenerateTextAsync", "GenerateJsonAsync", "GenerateEmbeddingAsync" })
        {
            var methodBody = ExtractMethodBody(llmGatewaySource, methodName);
            if (!methodBody.Contains("_concurrencyGate.RunAsync", StringComparison.Ordinal))
            {
                violations.Add($"LlmGatewayService.{methodName} must run through the global LLM concurrency gate.");
            }
        }

        if (!serviceCollectionSource.Contains("AddSingleton<ILlmConcurrencyGate>", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains("GetRequiredService<IOptions<LlmConfig>>()", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains(".Value.MaxConcurrency", StringComparison.Ordinal))
        {
            violations.Add("AddAIServices must register one singleton ILlmConcurrencyGate using IOptions<LlmConfig>.Value.MaxConcurrency.");
        }

        if (!schedulingAgentSource.Contains("AiPromptBudget.Bound(BuildSchedulingPrompt", StringComparison.Ordinal)
            || !promptBudgetSource.Contains("MaxInputTokens = 4000", StringComparison.Ordinal))
        {
            violations.Add("SchedulingAgent must bound prompts to the 4000-token budget before calling LLM.");
        }

        if (!aiProjectSource.Contains("<Compile Remove=\"Services\\LlmGatewayService.cs\"", StringComparison.Ordinal)
            || !aiProjectSource.Contains("<Compile Remove=\"Services\\LlmConcurrencyGate.cs\"", StringComparison.Ordinal))
        {
            violations.Add("MES.AI open-source slicing must continue to exclude Pro-only LLM gateway and concurrency gate services.");
        }

        violations.Should().BeEmpty("Sprint 4 LLM cost controls require a global LLM concurrency gate plus SchedulingAgent prompt token budget");
    }

    [Fact]
    public void Sprint5ProAiConfiguration_ShouldUseOptionsInsteadOfManualRuntimeBinding()
    {
        var repositoryRoot = FindRepositoryRoot();
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var llmGatewaySource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/LlmGatewayService.cs"));
        var qdrantVectorStoreSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/QdrantVectorStoreService.cs"));
        var onnxInferenceSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.AI/Services/OnnxInferenceService.cs"));
        var llmEndpointsSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/LlmEndpoints.cs"));
        var addAiBody = ExtractMethodBody(serviceCollectionSource, "AddAIServices");
        var violations = new List<string>();

        foreach (var forbidden in new[]
        {
            "var llmConfig = new LlmConfig();",
            "configuration.GetSection(\"AI:Llm\").Bind(llmConfig);",
            "services.AddSingleton(llmConfig);",
            "var vectorStoreConfig = new VectorStoreConfig();",
            "configuration.GetSection(\"AI:VectorStore\").Bind(vectorStoreConfig);",
            "services.AddSingleton(vectorStoreConfig);",
            "var onnxConfig = new OnnxConfig();",
            "configuration.GetSection(\"AI:Onnx\").Bind(onnxConfig);",
            "services.AddSingleton(onnxConfig);"
        })
        {
            if (addAiBody.Contains(forbidden, StringComparison.Ordinal))
            {
                violations.Add($"AddAIServices must not manually bind Pro AI config at runtime: {forbidden}");
            }
        }

        if (!addAiBody.Contains("GetRequiredService<IOptions<LlmConfig>>()", StringComparison.Ordinal)
            || !addAiBody.Contains(".Value.MaxConcurrency", StringComparison.Ordinal))
        {
            violations.Add("AddAIServices must build ILlmConcurrencyGate from IOptions<LlmConfig>.");
        }

        if (!addAiBody.Contains("GetRequiredService<IOptions<VectorStoreConfig>>()", StringComparison.Ordinal)
            || !addAiBody.Contains("vectorStoreOptions.Value.Provider", StringComparison.Ordinal)
            || !addAiBody.Contains(".Value.Qdrant", StringComparison.Ordinal))
        {
            violations.Add("AddAIServices must select vector store services from IOptions<VectorStoreConfig>.");
        }

        if (!llmGatewaySource.Contains("IOptions<LlmConfig>", StringComparison.Ordinal)
            || !qdrantVectorStoreSource.Contains("IOptions<QdrantConfig>", StringComparison.Ordinal)
            || !onnxInferenceSource.Contains("IOptions<OnnxConfig>", StringComparison.Ordinal)
            || !llmEndpointsSource.Contains("IOptions<LlmConfig>", StringComparison.Ordinal))
        {
            violations.Add("Pro AI runtime services and endpoints must consume config through IOptions<T>.");
        }

        violations.Should().BeEmpty("Sprint 5 M3 requires Pro AI runtime configuration to use validated IOptions<T> instead of manual IConfiguration binding");
    }

    [Fact]
    public void Sprint4SchedulingContextCache_ShouldInvalidateFullSnapshotsFromEvents()
    {
        var repositoryRoot = FindRepositoryRoot();
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var cacheSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Services/SchedulingContextCache.cs"));
        var providerSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Services/SchedulingContextProvider.cs"));
        var consumersSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Events/SchedulingIntegrationEventConsumers.cs"));
        var violations = new List<string>();

        if (!serviceCollectionSource.Contains("AddSingleton<ISchedulingContextCache, SchedulingContextCache>", StringComparison.Ordinal))
        {
            violations.Add("Scheduling context cache must be registered as a singleton so all providers/consumers share invalidation state.");
        }

        if (!cacheSource.Contains("CancellationChangeToken", StringComparison.Ordinal)
            || !cacheSource.Contains("InvalidateAll()", StringComparison.Ordinal))
        {
            violations.Add("SchedulingContextCache must support token-based full snapshot invalidation.");
        }

        if (!providerSource.Contains("ISchedulingContextCache", StringComparison.Ordinal)
            || !providerSource.Contains("TryGetFullSnapshot", StringComparison.Ordinal)
            || !providerSource.Contains("SetFullSnapshot", StringComparison.Ordinal))
        {
            violations.Add("SchedulingContextProvider must use ISchedulingContextCache for full scheduling snapshots.");
        }

        foreach (var methodName in new[] { "HandleOperationReportedAsync", "HandleSchedulePlanCreatedAsync" })
        {
            var methodBody = ExtractMethodBody(providerSource, methodName);
            if (!methodBody.Contains("_cache.InvalidateAll()", StringComparison.Ordinal))
            {
                violations.Add($"SchedulingContextProvider.{methodName} must invalidate full cached snapshots.");
            }
        }

        foreach (var consumerName in new[] { "OperationReportedIntegrationEventConsumer", "SchedulePlanCreatedIntegrationEventConsumer" })
        {
            var consumerStart = consumersSource.IndexOf($"public class {consumerName}", StringComparison.Ordinal);
            consumerStart.Should().BeGreaterThanOrEqualTo(0, $"{consumerName} should exist");
            var consumerSource = ExtractMethodBody(consumersSource[consumerStart..], consumerName);
            if (!consumerSource.Contains("ISchedulingContextCache", StringComparison.Ordinal)
                || !consumerSource.Contains("_cache.InvalidateAll()", StringComparison.Ordinal))
            {
                violations.Add($"{consumerName} must invalidate shared scheduling context cache when consuming events.");
            }
        }

        violations.Should().BeEmpty("Sprint 4 cache event-driven invalidation requires shared scheduling context cache invalidated from domain and integration events");
    }

    [Fact]
    public void Sprint5AsyncCode_ShouldNotUseBlockingResultOrWait()
    {
        var backendRoot = Path.Combine(FindRepositoryRoot(), "src/backend");
        var blockedDirectories = new[]
        {
            $"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}",
            $"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}",
            $"{Path.DirectorySeparatorChar}wwwroot{Path.DirectorySeparatorChar}"
        };
        var blockingAsyncPattern = new Regex(@"\b[A-Za-z_][A-Za-z0-9_]*Task\.Result\b|\.Wait\s*\(", RegexOptions.Compiled);

        var violations = Directory.GetFiles(backendRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !blockedDirectories.Any(blocked => file.Contains(blocked, StringComparison.OrdinalIgnoreCase)))
            .SelectMany(file => File.ReadLines(file)
                .Select((line, index) => new
                {
                    File = Path.GetRelativePath(backendRoot, file),
                    LineNumber = index + 1,
                    Text = line
                })
                .Where(candidate => blockingAsyncPattern.IsMatch(candidate.Text))
                .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text.Trim()}"))
            .ToList();

        violations.Should().BeEmpty("Sprint 5 L1-L6 requires async code to await tasks instead of blocking with Task.Result or Wait()");
    }

    [Fact]
    public void Sprint6BackendCode_ShouldNotWriteDirectlyToConsole()
    {
        var backendRoot = Path.Combine(FindRepositoryRoot(), "src/backend");
        var blockedDirectories = new[]
        {
            $"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}",
            $"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}",
            $"{Path.DirectorySeparatorChar}wwwroot{Path.DirectorySeparatorChar}"
        };
        var consoleWritePattern = new Regex(@"\b(?:System\.)?Console\.Write(?:Line)?\s*\(", RegexOptions.Compiled);

        var violations = Directory.GetFiles(backendRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !blockedDirectories.Any(blocked => file.Contains(blocked, StringComparison.OrdinalIgnoreCase)))
            .SelectMany(file => File.ReadLines(file)
                .Select((line, index) => new
                {
                    File = Path.GetRelativePath(backendRoot, file),
                    LineNumber = index + 1,
                    Text = line
                })
                .Where(candidate => consoleWritePattern.IsMatch(candidate.Text))
                .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text.Trim()}"))
            .ToList();

        violations.Should().BeEmpty("Sprint 6 6.7 requires backend production code to use ILogger or framework logging instead of Console.Write*");
    }

    [Fact]
    public void Sprint6PullRequestTemplate_ShouldRequireCodeHygieneChecklist()
    {
        var templatePath = Path.Combine(FindRepositoryRoot(), ".github/pull_request_template.md");
        File.Exists(templatePath).Should().BeTrue("Sprint 6 6.7 requires a PR template for manual review gates");

        var template = File.ReadAllText(templatePath);
        var requiredItems = new[]
        {
            "static List",
            "Console.Write*",
            ".Result",
            ".Wait()",
            "ArchitectureTests"
        };

        var missingItems = requiredItems
            .Where(item => !template.Contains(item, StringComparison.Ordinal))
            .ToList();

        missingItems.Should().BeEmpty("the PR template must preserve Sprint 6 6.7 manual code hygiene checks");
    }

    [Fact]
    public void Sprint6IntegrationTests_ShouldUseExplicitSerialCollection()
    {
        var integrationRoot = Path.Combine(FindRepositoryRoot(), "src/tests/MES.Tests.Integration");
        var sourceFiles = Directory.GetFiles(integrationRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            .ToArray();
        var collectionDefinitionFound = sourceFiles
            .Select(File.ReadAllText)
            .Any(source => source.Contains("[CollectionDefinition(\"IntegrationSerial\"", StringComparison.Ordinal));
        collectionDefinitionFound.Should().BeTrue("Sprint 6 6.3 requires an explicit serial collection definition for integration tests");

        var testClassPattern = new Regex(@"public\s+(?:sealed\s+)?class\s+(?<name>\w+Tests)\b", RegexOptions.Compiled);
        var violations = sourceFiles
            .SelectMany(file =>
            {
                var source = File.ReadAllText(file);
                return testClassPattern.Matches(source)
                    .Where(match => !ClassHasAttribute(source, match.Index, "[Collection(\"IntegrationSerial\")]"))
                    .Select(match => $"{Path.GetRelativePath(integrationRoot, file)}:{match.Groups["name"].Value}");
            })
            .ToList();

        violations.Should().BeEmpty("Sprint 6 6.3 requires every integration test class to opt into the explicit serial collection");
    }

    [Fact]
    public void Sprint6PerformanceTests_ShouldUseDedicatedFactoryAndSeed()
    {
        var repositoryRoot = FindRepositoryRoot();
        var performanceSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/PerformanceTests.cs"));
        var factorySource = File.ReadAllText(Path.Combine(repositoryRoot, "src/tests/MES.Tests.Integration/PerformanceTestWebApplicationFactory.cs"));
        var violations = new List<string>();

        if (!performanceSource.Contains("IClassFixture<PerformanceTestWebApplicationFactory>", StringComparison.Ordinal)
            || performanceSource.Contains("IClassFixture<TestWebApplicationFactory>", StringComparison.Ordinal))
        {
            violations.Add("PerformanceTests must use a dedicated PerformanceTestWebApplicationFactory fixture.");
        }

        if (!performanceSource.Contains("PerformanceTestWebApplicationFactory", StringComparison.Ordinal)
            || performanceSource.Contains("private readonly TestWebApplicationFactory", StringComparison.Ordinal)
            || performanceSource.Contains("PerformanceTests(TestWebApplicationFactory", StringComparison.Ordinal))
        {
            violations.Add("PerformanceTests must depend on the dedicated performance factory type.");
        }

        if (!factorySource.Contains("Performance_Test_DB", StringComparison.Ordinal)
            || factorySource.Contains("MES_Test_DB", StringComparison.Ordinal))
        {
            violations.Add("PerformanceTestWebApplicationFactory must use a dedicated InMemory database name.");
        }

        if (!factorySource.Contains("PerformanceTestDataSeedFilter", StringComparison.Ordinal)
            || factorySource.Contains("AddTransient<IStartupFilter, TestDataSeedFilter>", StringComparison.Ordinal))
        {
            violations.Add("PerformanceTestWebApplicationFactory must use a dedicated performance seed filter.");
        }

        violations.Should().BeEmpty("Sprint 6 6.4 requires PerformanceTests to isolate DbContext and seed data from the shared integration fixture");
    }

    [Fact]
    public void Sprint6E2eTests_ShouldNotUseHardWaits()
    {
        var e2eRoot = Path.Combine(FindRepositoryRoot(), "src/frontend/tests/e2e");
        var hardWaitPattern = new Regex(@"\.waitForTimeout\s*\(", RegexOptions.Compiled);

        var violations = Directory.GetFiles(e2eRoot, "*.ts", SearchOption.AllDirectories)
            .SelectMany(file => File.ReadLines(file)
                .Select((line, index) => new
                {
                    File = Path.GetRelativePath(e2eRoot, file),
                    LineNumber = index + 1,
                    Text = line
                })
                .Where(candidate => hardWaitPattern.IsMatch(candidate.Text))
                .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text.Trim()}"))
            .ToList();

        violations.Should().BeEmpty("Sprint 6 6.5 requires E2E tests to wait on visible UI state instead of fixed timeouts");
    }

    [Fact]
    public void Sprint6ScheduleAgentEvidenceLinks_ShouldSetBusinessEventTimestamp()
    {
        var repositoryRoot = FindRepositoryRoot();
        var servicePath = Path.Combine(repositoryRoot, "src/backend/MES.Application/Services/ScheduleAgentService.cs");
        var source = File.ReadAllText(servicePath);
        var violations = new List<string>();
        var searchIndex = 0;

        while (true)
        {
            var objectIndex = source.IndexOf("new AgentEvidenceLink", searchIndex, StringComparison.Ordinal);
            if (objectIndex < 0)
            {
                break;
            }

            var initializer = ExtractObjectInitializer(source, objectIndex);
            var lineNumber = source[..objectIndex].Count(character => character == '\n') + 1;

            if (!initializer.Contains("CreatedAt =", StringComparison.Ordinal))
            {
                violations.Add($"ScheduleAgentService.cs:{lineNumber}: AgentEvidenceLink must set CreatedAt from the business event timestamp.");
            }
            else if (initializer.Contains("CreatedAt = DateTime.UtcNow", StringComparison.Ordinal))
            {
                violations.Add($"ScheduleAgentService.cs:{lineNumber}: AgentEvidenceLink must not use the save timestamp for CreatedAt.");
            }

            searchIndex = objectIndex + "new AgentEvidenceLink".Length;
        }

        violations.Should().BeEmpty("ScheduleAgent evidence replay is ordered by AgentEvidenceLink.CreatedAt, so each evidence link must carry the source event time rather than the save time");
    }

    [Fact]
    public void Sprint6ScheduleAgentService_ShouldNotUseNullForgivingOperator()
    {
        var sourcePath = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Application/Services/ScheduleAgentService.cs");
        var nullForgivingPattern = new Regex(@"\b[A-Za-z_][A-Za-z0-9_]*!(?![=])", RegexOptions.Compiled);
        var violations = File.ReadLines(sourcePath)
            .Select((line, index) => new
            {
                LineNumber = index + 1,
                Text = line
            })
            .Where(candidate => nullForgivingPattern.IsMatch(candidate.Text))
            .Select(candidate => $"ScheduleAgentService.cs:{candidate.LineNumber}: {candidate.Text.Trim()}")
            .ToList();

        violations.Should().BeEmpty("project rules forbid null-forgiving suppression; query mapping should filter nulls without item!");
    }

    [Fact]
    public void Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator()
    {
        var repositoryRoot = FindRepositoryRoot();
        var files = new[]
        {
            "src/backend/MES.Infrastructure/Services/SchedulingContextProvider.cs",
            "src/backend/MES.Api/Endpoints/ReportEndpoints.cs"
        };
        var nullForgivingPattern = new Regex(@"\b[A-Za-z_][A-Za-z0-9_]*!(?![=])", RegexOptions.Compiled);
        var violations = files
            .SelectMany(file =>
            {
                var fullPath = Path.Combine(repositoryRoot, file);
                return File.ReadLines(fullPath)
                    .Select((line, index) => new
                    {
                        File = file,
                        LineNumber = index + 1,
                        Text = line
                    })
                    .Where(candidate => nullForgivingPattern.IsMatch(candidate.Text))
                    .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text.Trim()}");
            })
            .ToList();

        violations.Should().BeEmpty("project rules forbid null-forgiving suppression in critical scheduling/reporting paths");
    }

    [Fact]
    public void Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator()
    {
        var repositoryRoot = FindRepositoryRoot();
        var files = new[]
        {
            "src/backend/MES.Infrastructure/Repositories/NotificationConfigRepository.cs",
            "src/backend/MES.Infrastructure/Repositories/RefreshTokenRepository.cs"
        };
        var nullForgivingPattern = new Regex(@"\b[A-Za-z_][A-Za-z0-9_]*!(?![=])", RegexOptions.Compiled);
        var violations = files
            .SelectMany(file =>
            {
                var fullPath = Path.Combine(repositoryRoot, file);
                return File.ReadLines(fullPath)
                    .Select((line, index) => new
                    {
                        File = file,
                        LineNumber = index + 1,
                        Text = line
                    })
                    .Where(candidate => nullForgivingPattern.IsMatch(candidate.Text))
                    .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text.Trim()}");
            })
            .ToList();

        violations.Should().BeEmpty("MesDbContext exposes non-null DbSet properties for notification configs and refresh tokens");
    }

    [Fact]
    public void Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims()
    {
        var sourcePath = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Endpoints/AuthEndpoints.cs");
        var tokenClaimSuppressionPattern = new Regex(@"\b(role|displayName)!(?![=])", RegexOptions.Compiled);
        var violations = File.ReadLines(sourcePath)
            .Select((line, index) => new
            {
                LineNumber = index + 1,
                Text = line
            })
            .Where(candidate => tokenClaimSuppressionPattern.IsMatch(candidate.Text))
            .Select(candidate => $"AuthEndpoints.cs:{candidate.LineNumber}: {candidate.Text.Trim()}")
            .ToList();

        violations.Should().BeEmpty("successful auth responses must narrow role and displayName before signing token claims");
    }

    [Fact]
    public void Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus()
    {
        var sourcePath = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Middleware/ExceptionMiddleware.cs");
        var problemStatusSuppressionPattern = new Regex(@"\bproblem\.Status!(?![=])", RegexOptions.Compiled);
        var violations = File.ReadLines(sourcePath)
            .Select((line, index) => new
            {
                LineNumber = index + 1,
                Text = line
            })
            .Where(candidate => problemStatusSuppressionPattern.IsMatch(candidate.Text))
            .Select(candidate => $"ExceptionMiddleware.cs:{candidate.LineNumber}: {candidate.Text.Trim()}")
            .ToList();

        violations.Should().BeEmpty("ExceptionMiddleware sets ProblemDetails.Status in every branch and should read it without null-forgiving suppression");
    }

    [Fact]
    public void Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters()
    {
        var endpointDirectory = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Endpoints");
        var defaultNullForgivingPattern = new Regex(@"=\s*default!", RegexOptions.Compiled);
        var violations = Directory.GetFiles(endpointDirectory, "*.cs")
            .SelectMany(file => File.ReadLines(file)
                .Select((line, index) => new
                {
                    File = Path.GetFileName(file),
                    LineNumber = index + 1,
                    Text = line
                })
                .Where(candidate => defaultNullForgivingPattern.IsMatch(candidate.Text))
                .Select(candidate => $"{candidate.File}:{candidate.LineNumber}: {candidate.Text.Trim()}"))
            .ToList();

        violations.Should().BeEmpty("Minimal API handlers can place DI parameters before optional query defaults instead of using default! suppression");
    }

    [Fact]
    public void Sprint5ScanEndpoints_ShouldUseTargetedRepositoryLookups()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scanSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Endpoints/ScanEndpoints.cs"));
        var equipmentRepositorySource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories/EquipmentRepository.cs"));
        var workOrderRepositorySource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Infrastructure/Repositories/WorkOrderRepository.cs"));
        var equipmentInterfaceSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Domain/Interfaces/Repositories/IEquipmentRepository.cs"));
        var workOrderInterfaceSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Domain/Interfaces/Repositories/IWorkOrderRepository.cs"));
        var lookupBody = ExtractMethodBody(scanSource, "LookupByCodeAsync");
        var violations = new List<string>();

        if (lookupBody.Contains("equipmentRepo.GetAllAsync", StringComparison.Ordinal)
            || lookupBody.Contains("workOrderRepo.GetAllAsync", StringComparison.Ordinal)
            || lookupBody.Contains("FirstOrDefault", StringComparison.Ordinal))
        {
            violations.Add("ScanEndpoints must not load all equipment or work orders and filter in memory.");
        }

        if (!equipmentInterfaceSource.Contains("Task<Equipment?> GetByCodeAsync(string equipmentCode, CancellationToken ct = default)", StringComparison.Ordinal)
            || !equipmentRepositorySource.Contains("GetByCodeAsync(string equipmentCode, CancellationToken ct = default)", StringComparison.Ordinal)
            || !equipmentRepositorySource.Contains("FirstOrDefaultAsync(e => e.EquipmentCode == equipmentCode, ct)", StringComparison.Ordinal))
        {
            violations.Add("IEquipmentRepository must expose an EF-backed lookup by equipment code.");
        }

        if (!workOrderInterfaceSource.Contains("Task<WorkOrder?> GetByCodeAsync(string code, CancellationToken ct = default)", StringComparison.Ordinal)
            || !workOrderRepositorySource.Contains("GetByCodeAsync(string code, CancellationToken ct = default)", StringComparison.Ordinal)
            || !workOrderRepositorySource.Contains("FirstOrDefaultAsync(w => w.OrderNumber == code || w.Id == code, ct)", StringComparison.Ordinal))
        {
            violations.Add("IWorkOrderRepository must expose an EF-backed lookup by order number or id.");
        }

        if (!lookupBody.Contains("equipmentRepo.GetByCodeAsync(code, ct)", StringComparison.Ordinal)
            || !lookupBody.Contains("workOrderRepo.GetByCodeAsync(code, ct)", StringComparison.Ordinal))
        {
            violations.Add("ScanEndpoints must use targeted equipment and work order repository lookups.");
        }

        violations.Should().BeEmpty("Sprint 5 5.9 requires ScanEndpoints to avoid full-table in-memory lookup during barcode scans");
    }

    [Fact]
    public void H17SigningKeyStore_ShouldUseDistributedCacheForCrossReplicaValidation()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var signingKeyStoreSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Services/SigningKeyStore.cs"));
        var violations = new List<string>();

        if (!signingKeyStoreSource.Contains("IDistributedCache", StringComparison.Ordinal)
            || !signingKeyStoreSource.Contains("aimes:signing-key:", StringComparison.Ordinal)
            || !signingKeyStoreSource.Contains("PublishKey", StringComparison.Ordinal)
            || !signingKeyStoreSource.Contains("LoadKeyFromCache", StringComparison.Ordinal)
            || !signingKeyStoreSource.Contains("LoadCurrentKeyFromCache", StringComparison.Ordinal))
        {
            violations.Add("SigningKeyStore must persist signing keys through IDistributedCache for Redis-backed cross-replica validation.");
        }

        if (!programSource.Contains("sp.GetRequiredService<IDistributedCache>()", StringComparison.Ordinal)
            || !programSource.Contains("new SigningKeyStore(", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must construct SigningKeyStore with the configured IDistributedCache instance.");
        }

        violations.Should().BeEmpty("Sprint 5 H17 requires signing keys to be shared across API replicas through Redis-backed IDistributedCache");
    }

    [Fact]
    public void H16TokenBlacklist_ShouldUseDistributedCacheForCrossReplicaRevocation()
    {
        var repositoryRoot = FindRepositoryRoot();
        var programSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Program.cs"));
        var serviceCollectionSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs"));
        var tokenBlacklistSource = File.ReadAllText(Path.Combine(repositoryRoot, "src/backend/MES.Api/Services/TokenBlacklistService.cs"));
        var violations = new List<string>();

        if (!tokenBlacklistSource.Contains("IDistributedCache", StringComparison.Ordinal)
            || !tokenBlacklistSource.Contains("aimes:token-blacklist:", StringComparison.Ordinal)
            || !tokenBlacklistSource.Contains("_cache.SetAsync(", StringComparison.Ordinal)
            || !tokenBlacklistSource.Contains("_cache.GetAsync(", StringComparison.Ordinal))
        {
            violations.Add("TokenBlacklistService must persist revoked JWT JTIs through IDistributedCache for cross-replica revocation.");
        }

        if (tokenBlacklistSource.Contains("ConcurrentDictionary", StringComparison.Ordinal)
            || tokenBlacklistSource.Contains("Dictionary<string", StringComparison.Ordinal)
            || tokenBlacklistSource.Contains("static readonly HashSet", StringComparison.Ordinal))
        {
            violations.Add("TokenBlacklistService must not use process-local collections for revocation state.");
        }

        if (!programSource.Contains("builder.Services.AddSingleton<TokenBlacklistService>();", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must register TokenBlacklistService through DI so it receives the configured IDistributedCache.");
        }

        if (!serviceCollectionSource.Contains("services.AddStackExchangeRedisCache", StringComparison.Ordinal)
            || !serviceCollectionSource.Contains("services.AddDistributedMemoryCache", StringComparison.Ordinal))
        {
            violations.Add("AddCacheServices must keep Redis-backed IDistributedCache with memory fallback for local development.");
        }

        violations.Should().BeEmpty("Sprint 5 H16 requires token revocation state to be shared across API replicas through Redis-backed IDistributedCache");
    }

    [Fact]
    public void M13RequestLogging_ShouldUseSerilogMiddlewareOnly()
    {
        var repositoryRoot = FindRepositoryRoot();
        var apiRoot = Path.Combine(repositoryRoot, "src/backend/MES.Api");
        var programSource = File.ReadAllText(Path.Combine(apiRoot, "Program.cs"));
        var requestLoggingPath = Path.Combine(apiRoot, "Middleware/RequestLoggingMiddleware.cs");
        var violations = new List<string>();

        if (File.Exists(requestLoggingPath))
        {
            violations.Add("RequestLoggingMiddleware.cs should be removed; Serilog request logging is the single request logging path.");
        }

        if (programSource.Contains("UseMiddleware<RequestLoggingMiddleware>", StringComparison.Ordinal)
            || programSource.Contains("RequestLoggingMiddleware", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must not register the custom RequestLoggingMiddleware.");
        }

        if (!programSource.Contains("app.UseSerilogRequestLogging();", StringComparison.Ordinal))
        {
            violations.Add("Program.cs must keep Serilog request logging enabled.");
        }

        violations.Should().BeEmpty("Sprint 5 M13 removes the custom request logging middleware in favor of Serilog request logging");
    }

    [Fact]
    public void M11ExceptionMiddleware_ShouldHandleOperationCanceledSeparately()
    {
        var source = File.ReadAllText(Path.Combine(FindRepositoryRoot(), "src/backend/MES.Api/Middleware/ExceptionMiddleware.cs"));
        var invokeBody = ExtractMethodBody(source, "InvokeAsync");

        invokeBody.Should().Contain("catch (OperationCanceledException)", "Sprint 3 M11 requires request cancellation to bypass generic 500 handling");
        invokeBody.IndexOf("catch (OperationCanceledException)", StringComparison.Ordinal)
            .Should().BeLessThan(
                invokeBody.IndexOf("catch (Exception", StringComparison.Ordinal),
                "OperationCanceledException must be matched before the generic exception handler");
    }

    [Fact]
    public void Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var middlewarePath = Path.Combine(repositoryRoot, "src/backend/MES.Api/Middleware/ExceptionMiddleware.cs");
        var testPath = Path.Combine(repositoryRoot, "src/tests/MES.Tests.Unit/Middleware/ExceptionMiddlewareTests.cs");
        var matrixPath = Path.Combine(repositoryRoot, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");
        var violations = new List<string>();

        foreach (var path in new[] { middlewarePath, testPath, matrixPath })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{Path.GetRelativePath(repositoryRoot, path)} is required for Sprint 3 OperationCanceledException evidence.");
            }
        }

        if (File.Exists(middlewarePath))
        {
            var middleware = File.ReadAllText(middlewarePath);
            var invokeBody = ExtractMethodBody(middleware, "InvokeAsync");
            var canceledHandlerBody = ExtractMethodBody(middleware, "HandleOperationCanceledAsync");

            if (!invokeBody.Contains("catch (OperationCanceledException)", StringComparison.Ordinal))
            {
                violations.Add("ExceptionMiddleware.InvokeAsync must catch OperationCanceledException explicitly.");
            }

            if (invokeBody.IndexOf("catch (OperationCanceledException)", StringComparison.Ordinal)
                > invokeBody.IndexOf("catch (Exception ex)", StringComparison.Ordinal))
            {
                violations.Add("ExceptionMiddleware.InvokeAsync must catch OperationCanceledException before the generic exception handler.");
            }

            foreach (var requiredToken in new[]
            {
                "await HandleOperationCanceledAsync(context);",
                "context.Response.Clear();",
                "context.Response.StatusCode = 499;",
                "return Task.CompletedTask;"
            })
            {
                if (!middleware.Contains(requiredToken, StringComparison.Ordinal)
                    && !canceledHandlerBody.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ExceptionMiddleware missing OperationCanceled handling token: {requiredToken}");
                }
            }

            if (canceledHandlerBody.Contains("WriteAsJsonAsync", StringComparison.Ordinal)
                || canceledHandlerBody.Contains("ProblemDetails", StringComparison.Ordinal)
                || canceledHandlerBody.Contains("LogError", StringComparison.Ordinal))
            {
                violations.Add("OperationCanceledException must not be logged or serialized as a ProblemDetails application fault.");
            }
        }

        if (File.Exists(testPath))
        {
            var tests = File.ReadAllText(testPath);
            foreach (var requiredToken in new[]
            {
                "InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails",
                "throw new OperationCanceledException(\"request canceled\")",
                "context.Response.StatusCode.Should().Be(499",
                "context.Response.ContentType.Should().BeNull()",
                "responseBody.Length.Should().Be(0)"
            })
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"ExceptionMiddlewareTests missing OperationCanceled evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "`OperationCanceledException` handled separately",
                "ExceptionMiddleware.InvokeAsync",
                "HandleOperationCanceledAsync",
                "InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails",
                "StatusCode.Should().Be(499",
                "Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing OperationCanceledException direct evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 OperationCanceledException handling needs direct middleware and unit-test evidence, not only the broad M11 gate");
    }

    [Fact]
    public void M12DomainEntities_ShouldUseDomainRuleViolationExceptionForStateRules()
    {
        var domainRoot = Path.Combine(FindRepositoryRoot(), "src/backend/MES.Domain");
        var entityFiles = Directory.GetFiles(Path.Combine(domainRoot, "Entities"), "*.cs", SearchOption.AllDirectories);
        var violations = entityFiles
            .Where(file => File.ReadAllText(file).Contains("throw new InvalidOperationException", StringComparison.Ordinal))
            .Select(file => Path.GetRelativePath(domainRoot, file))
            .ToList();

        violations.Should().BeEmpty("Sprint 3 M12 requires domain entity rule violations to use DomainRuleViolationException instead of generic InvalidOperationException");
    }

    [Fact]
    public void Sprint3DomainRuleViolationException_ShouldHaveDirectDomainUnitEvidence()
    {
        var root = FindRepositoryRoot();
        var violations = new List<string>();

        var exceptionPath = Path.Combine(root, "src/backend/MES.Domain/Exceptions/DomainRuleViolationException.cs");
        var workOrderPath = Path.Combine(root, "src/backend/MES.Domain/Entities/Production/WorkOrder.cs");
        var equipmentPath = Path.Combine(root, "src/backend/MES.Domain/Entities/Equipment/Equipment.cs");
        var operationExecutionPath = Path.Combine(root, "src/backend/MES.Domain/Entities/Production/OperationExecution.cs");
        var materialPath = Path.Combine(root, "src/backend/MES.Domain/Entities/Production/Material.cs");
        var workOrderTestsPath = Path.Combine(root, "src/tests/MES.Tests.Unit/Domain/WorkOrderTests.cs");
        var equipmentTestsPath = Path.Combine(root, "src/tests/MES.Tests.Unit/Domain/EquipmentTests.cs");
        var operationTestsPath = Path.Combine(root, "src/tests/MES.Tests.Unit/Domain/OperationExecutionStateMachineTests.cs");
        var materialTestsPath = Path.Combine(root, "src/tests/MES.Tests.Unit/Domain/MaterialTests.cs");
        var matrixPath = Path.Combine(root, "_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md");

        if (File.Exists(exceptionPath))
        {
            var exception = File.ReadAllText(exceptionPath);
            foreach (var requiredToken in new[]
            {
                "public class DomainRuleViolationException : InvalidOperationException",
                "public DomainRuleViolationException(string message)"
            })
            {
                if (!exception.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"DomainRuleViolationException missing compatibility token: {requiredToken}");
                }
            }
        }

        foreach (var (path, label, requiredTokens) in new[]
        {
            (workOrderPath, "WorkOrder", new[]
            {
                "throw new DomainRuleViolationException($\"工单当前状态 {Status} 不允许启动\")",
                "throw new DomainRuleViolationException($\"工单当前状态 {Status} 不允许完成\")",
                "throw new DomainRuleViolationException($\"工单当前状态 {Status} 不允许取消\")",
                "throw new DomainRuleViolationException($\"不支持转换到状态 {target}\")"
            }),
            (equipmentPath, "Equipment", new[]
            {
                "throw new DomainRuleViolationException($\"设备当前状态 {Status} 无法开始工作\")",
                "throw new DomainRuleViolationException(\"只有运行中或空闲的设备可以报告故障\")",
                "default: throw new DomainRuleViolationException($\"不支持转换到状态 {target}\")"
            }),
            (operationExecutionPath, "OperationExecution", new[]
            {
                "throw new DomainRuleViolationException(\"Only pending or paused operations can be started.\")",
                "throw new DomainRuleViolationException(\"Only running operations can be completed.\")",
                "throw new DomainRuleViolationException(\"Only active operations can report exceptions.\")"
            }),
            (materialPath, "Material", new[]
            {
                "throw new DomainRuleViolationException($\"可用库存不足：需要 {quantity}，可用 {NetAvailable}\")",
                "throw new DomainRuleViolationException($\"库存不足：需要消耗 {quantity}，可用 {AvailableQuantity}\")"
            })
        })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{label} source file missing.");
                continue;
            }

            var source = File.ReadAllText(path);
            foreach (var requiredToken in requiredTokens)
            {
                if (!source.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"{label} missing DomainRuleViolationException source token: {requiredToken}");
                }
            }
        }

        foreach (var (path, label, requiredTokens) in new[]
        {
            (workOrderTestsPath, "WorkOrderTests", new[]
            {
                "using MES.Domain.Exceptions;",
                "Start_WhenCompleted_ShouldThrow",
                "Complete_WhenNotStarted_ShouldThrow",
                "Cancel_WhenCompleted_ShouldThrow",
                "TransitionTo_InvalidTarget_ShouldThrow",
                "Throw<DomainRuleViolationException>()"
            }),
            (equipmentTestsPath, "EquipmentTests", new[]
            {
                "using MES.Domain.Exceptions;",
                "StartWork_WhenAlreadyRunning_ShouldThrow",
                "SetFault_WhenAvailable_ShouldThrow",
                "TransitionTo_InvalidTarget_ShouldThrow",
                "Throw<DomainRuleViolationException>()"
            }),
            (operationTestsPath, "OperationExecutionStateMachineTests", new[]
            {
                "using MES.Domain.Exceptions;",
                "Start_FromCompleted_ShouldThrow_PreventDoubleCount",
                "Complete_FromPending_ShouldThrow",
                "ReportException_FromCompleted_ShouldThrow",
                "Throw<DomainRuleViolationException>()"
            }),
            (materialTestsPath, "MaterialTests", new[]
            {
                "using MES.Domain.Exceptions;",
                "Reserve_WhenQuantityExceedsNetAvailable_ShouldThrowDomainRuleViolation",
                "Consume_WhenQuantityExceedsAvailable_ShouldThrowDomainRuleViolation",
                "Throw<DomainRuleViolationException>()"
            })
        })
        {
            if (!File.Exists(path))
            {
                violations.Add($"{label} file missing.");
                continue;
            }

            var tests = File.ReadAllText(path);
            foreach (var requiredToken in requiredTokens)
            {
                if (!tests.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"{label} missing direct DomainRuleViolationException evidence token: {requiredToken}");
                }
            }
        }

        if (File.Exists(matrixPath))
        {
            var matrix = File.ReadAllText(matrixPath);
            foreach (var requiredToken in new[]
            {
                "Domain state rules use `DomainRuleViolationException`",
                "WorkOrderTests.Start_WhenCompleted_ShouldThrow",
                "EquipmentTests.SetFault_WhenAvailable_ShouldThrow",
                "OperationExecutionStateMachineTests.Start_FromCompleted_ShouldThrow_PreventDoubleCount",
                "MaterialTests.Reserve_WhenQuantityExceedsNetAvailable_ShouldThrowDomainRuleViolation",
                "Sprint3DomainRuleViolationException_ShouldHaveDirectDomainUnitEvidence"
            })
            {
                if (!matrix.Contains(requiredToken, StringComparison.Ordinal))
                {
                    violations.Add($"Phase-one matrix missing direct DomainRuleViolationException evidence token: {requiredToken}");
                }
            }
        }

        violations.Should().BeEmpty("Sprint 3 domain rule evidence must prove concrete domain state/inventory rules throw DomainRuleViolationException directly, not only its InvalidOperationException base type");
    }

    private static bool IsMutableReference(Type type)
    {
        return !type.IsValueType && type != typeof(string);
    }

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null)
        {
            if (File.Exists(Path.Combine(current.FullName, "src", "backend", "AIMes.slnx")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new DirectoryNotFoundException("Could not locate AIMes repository root.");
    }

    private static IEnumerable<string> FindReadMethodsWithoutAsNoTracking(string file)
    {
        var lines = File.ReadAllLines(file);
        var source = File.ReadAllText(file);
        for (var index = 0; index < lines.Length; index++)
        {
            var line = lines[index];
            if (!IsRepositoryReadSignature(line))
            {
                continue;
            }

            var body = ExtractMethodBody(lines, index);
            if (!body.Contains("AsNoTracking", StringComparison.Ordinal)
                && !DelegatesToRepositoryRead(body)
                && !DelegatesToNoTrackingQueryHelper(source, body))
            {
                yield return $"{Path.GetFileName(file)}:{index + 1}:{line.Trim()}";
            }
        }
    }

    private static bool IsRepositoryReadSignature(string line)
    {
        var trimmed = line.Trim();
        if (!trimmed.StartsWith("public async Task", StringComparison.Ordinal))
        {
            return false;
        }

        if (trimmed.Contains("Count", StringComparison.Ordinal)
            || trimmed.Contains("Add", StringComparison.Ordinal)
            || trimmed.Contains("Create", StringComparison.Ordinal)
            || trimmed.Contains("Update", StringComparison.Ordinal)
            || trimmed.Contains("Delete", StringComparison.Ordinal)
            || trimmed.Contains("Save", StringComparison.Ordinal)
            || trimmed.Contains("Record", StringComparison.Ordinal)
            || trimmed.Contains("Upsert", StringComparison.Ordinal))
        {
            return false;
        }

        return trimmed.Contains("Get", StringComparison.Ordinal)
            || trimmed.Contains("Query", StringComparison.Ordinal);
    }

    private static bool DelegatesToRepositoryRead(string body)
    {
        return body.Contains("await Get", StringComparison.Ordinal)
            || body.Contains("return Get", StringComparison.Ordinal)
            || body.Contains("await Query", StringComparison.Ordinal)
            || body.Contains("return Query", StringComparison.Ordinal);
    }

    private static bool DelegatesToNoTrackingQueryHelper(string source, string body)
    {
        return ExtractPrivateMethodNames(source)
            .Where(name => name.StartsWith("Build", StringComparison.Ordinal)
                || name.StartsWith("Query", StringComparison.Ordinal))
            .Any(name => body.Contains($"{name}(", StringComparison.Ordinal)
                && ExtractMethodBody(source, name).Contains("AsNoTracking", StringComparison.Ordinal));
    }

    private static IEnumerable<string> ExtractPrivateMethodNames(string source)
    {
        using var reader = new StringReader(source);
        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            var trimmed = line.Trim();
            if (!trimmed.StartsWith("private ", StringComparison.Ordinal))
            {
                continue;
            }

            var openParenIndex = trimmed.IndexOf('(');
            if (openParenIndex <= 0)
            {
                continue;
            }

            var beforeParameters = trimmed[..openParenIndex].Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (beforeParameters.Length > 0)
            {
                yield return beforeParameters[^1];
            }
        }
    }

    private static MesDbContext CreateModelOnlyDbContext()
    {
        var options = new DbContextOptionsBuilder<MesDbContext>()
            .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=AIMesArchitectureTests;Trusted_Connection=True;")
            .Options;

        return new MesDbContext(options);
    }

    private static MesDbContext CreatePostgreSqlModelOnlyDbContext()
    {
        var options = new DbContextOptionsBuilder<MesDbContext>()
            .UseNpgsql("Host=localhost;Database=aimes_architecture;Username=postgres;Password=postgres")
            .Options;

        return new MesDbContext(options);
    }

    private static void RequireIndex<TEntity>(MesDbContext db, List<string> violations, params string[] propertyNames)
    {
        var entityType = db.Model.FindEntityType(typeof(TEntity));
        var hasIndex = entityType?.GetIndexes().Any(index =>
            index.Properties.Select(property => property.Name).SequenceEqual(propertyNames)) == true;

        if (!hasIndex)
        {
            violations.Add($"{typeof(TEntity).Name} missing index ({string.Join(", ", propertyNames)})");
        }
    }

    private static void RequireJsonb<TEntity>(MesDbContext db, List<string> violations, string propertyName)
    {
        var property = db.Model.FindEntityType(typeof(TEntity))?.FindProperty(propertyName);
        if (!string.Equals(property?.GetColumnType(), "jsonb", StringComparison.OrdinalIgnoreCase))
        {
            violations.Add($"{typeof(TEntity).Name}.{propertyName} must use jsonb");
        }
    }

    private static string ExtractMethodBody(string source, string methodName)
    {
        var methodIndex = source.IndexOf(methodName, StringComparison.Ordinal);
        while (methodIndex >= 0)
        {
            var nextBodyStart = source.IndexOf('{', methodIndex);
            var nextSemicolon = source.IndexOf(';', methodIndex);
            if (nextBodyStart >= 0 && (nextSemicolon < 0 || nextBodyStart < nextSemicolon))
                break;

            methodIndex = source.IndexOf(methodName, methodIndex + methodName.Length, StringComparison.Ordinal);
        }

        methodIndex.Should().BeGreaterThanOrEqualTo(0);

        var bodyStart = source.IndexOf('{', methodIndex);
        bodyStart.Should().BeGreaterThanOrEqualTo(0);

        var depth = 0;
        for (var index = bodyStart; index < source.Length; index++)
        {
            depth += source[index] switch
            {
                '{' => 1,
                '}' => -1,
                _ => 0
            };

            if (depth == 0)
            {
                return source.Substring(bodyStart, index - bodyStart + 1);
            }
        }

        throw new InvalidOperationException($"Could not extract method body for {methodName}.");
    }

    private static string ExtractStatement(string source, string statementStart)
    {
        var start = source.IndexOf(statementStart, StringComparison.Ordinal);
        start.Should().BeGreaterThanOrEqualTo(0, $"{statementStart} should exist");

        var end = source.IndexOf(';', start);
        end.Should().BeGreaterThanOrEqualTo(start, $"{statementStart} should terminate with semicolon");

        return source.Substring(start, end - start + 1);
    }

    private static string ExtractStatement(string source, int start)
    {
        start.Should().BeGreaterThanOrEqualTo(0);

        var end = source.IndexOf(';', start);
        end.Should().BeGreaterThanOrEqualTo(start, "endpoint mapping should terminate with semicolon");

        return source.Substring(start, end - start + 1);
    }

    private static string ExtractInvocation(string source, int methodStart)
    {
        methodStart.Should().BeGreaterThanOrEqualTo(0);

        var openParen = source.IndexOf('(', methodStart);
        openParen.Should().BeGreaterThanOrEqualTo(methodStart);

        var depth = 0;
        for (var index = openParen; index < source.Length; index++)
        {
            depth += source[index] switch
            {
                '(' => 1,
                ')' => -1,
                _ => 0
            };

            if (depth == 0)
            {
                return source.Substring(methodStart, index - methodStart + 1);
            }
        }

        throw new InvalidOperationException($"Could not extract invocation from index {methodStart}.");
    }

    private static string ExtractObjectInitializer(string source, int objectStart)
    {
        objectStart.Should().BeGreaterThanOrEqualTo(0);

        var bodyStart = source.IndexOf('{', objectStart);
        bodyStart.Should().BeGreaterThanOrEqualTo(objectStart);

        var depth = 0;
        for (var index = bodyStart; index < source.Length; index++)
        {
            depth += source[index] switch
            {
                '{' => 1,
                '}' => -1,
                _ => 0
            };

            if (depth == 0)
            {
                return source.Substring(bodyStart, index - bodyStart + 1);
            }
        }

        throw new InvalidOperationException($"Could not extract object initializer from index {objectStart}.");
    }

    private static string FirstLine(string statement)
    {
        using var reader = new StringReader(statement.Trim());
        return reader.ReadLine()?.Trim() ?? statement.Trim();
    }

    private static bool ClassHasAttribute(string source, int classIndex, string attribute)
    {
        var prefixStart = Math.Max(0, classIndex - 500);
        var prefix = source.Substring(prefixStart, classIndex - prefixStart);
        var previousClass = prefix.LastIndexOf("public class", StringComparison.Ordinal);
        var previousSealedClass = prefix.LastIndexOf("public sealed class", StringComparison.Ordinal);
        var previousTypeIndex = Math.Max(previousClass, previousSealedClass);
        var attributeScope = previousTypeIndex >= 0 ? prefix[(previousTypeIndex + 1)..] : prefix;

        return attributeScope.Contains(attribute, StringComparison.Ordinal);
    }

    private static IEnumerable<string> ReadMeaningfulLines(string source)
    {
        using var reader = new StringReader(source);
        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            var trimmed = line.Trim();
            if (trimmed.Length == 0 || trimmed.StartsWith('#'))
            {
                continue;
            }

            yield return trimmed;
        }
    }

    private static string ExtractDockerStage(string source, string stageName)
    {
        var stageMatch = Regex.Match(
            source,
            $@"^FROM\s+.+\s+AS\s+{Regex.Escape(stageName)}\s*$",
            RegexOptions.IgnoreCase | RegexOptions.Multiline);
        if (!stageMatch.Success)
        {
            return string.Empty;
        }

        var nextStageMatch = Regex.Match(
            source[(stageMatch.Index + stageMatch.Length)..],
            @"^FROM\s+",
            RegexOptions.IgnoreCase | RegexOptions.Multiline);

        return nextStageMatch.Success
            ? source.Substring(stageMatch.Index, stageMatch.Length + nextStageMatch.Index)
            : source[stageMatch.Index..];
    }

    private static string ExtractMethodBody(string[] lines, int signatureLineIndex)
    {
        var source = string.Join(Environment.NewLine, lines);
        var lineStart = 0;
        for (var index = 0; index < signatureLineIndex; index++)
        {
            lineStart += lines[index].Length + Environment.NewLine.Length;
        }

        var bodyStart = source.IndexOf('{', lineStart);
        bodyStart.Should().BeGreaterThanOrEqualTo(0);

        var depth = 0;
        for (var index = bodyStart; index < source.Length; index++)
        {
            depth += source[index] switch
            {
                '{' => 1,
                '}' => -1,
                _ => 0
            };

            if (depth == 0)
            {
                return source.Substring(bodyStart, index - bodyStart + 1);
            }
        }

        throw new InvalidOperationException($"Could not extract method body from line {signatureLineIndex + 1}.");
    }

    private sealed record RepositoryPagingCheck(string FileName, string MethodName, string GetAllCall);

    private sealed record RepositoryCommitCheck(string FileName, string MethodName);

    private sealed record CancellationTokenPropagationCheck(string FileName, string ForbiddenCall);

    private sealed record EndpointAuditCheck(string FileName, string Resource, string[] RouteStarts);

    private sealed record InlineAuditCheck(string FileName, string MethodName, string Action);
}
