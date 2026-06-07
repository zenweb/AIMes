using System.Reflection;
using System.Text.RegularExpressions;
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
        violations.Should().BeEmpty("Sprint 3 H3 keeps endpoint filters out of direct EF persistence");
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
    public void SecuritySignoff_ShouldHaveSelfAssessmentScriptAndUnsignedPacket()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-security-self-assessment.ps1");
        var signoffPath = Path.Combine(repositoryRoot, "_docs/_review/20260602-security-signoff.md");
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

        if (!File.Exists(signoffPath))
        {
            violations.Add("_docs/_review/20260602-security-signoff.md is required to fail loud on the security signoff gate.");
        }
        else
        {
            var signoff = File.ReadAllText(signoffPath);
            var requiredSignoffTokens = new[]
            {
                "Status: UNSIGNED",
                "Attack Chain A",
                "Attack Chain B",
                "Attack Chain C",
                "Signer:",
                "SignedAt:",
                "Evidence:",
                "Manual verification required",
                "cannot close the security signoff release gate"
            };

            violations.AddRange(requiredSignoffTokens
                .Where(token => !signoff.Contains(token, StringComparison.Ordinal))
                .Select(token => $"Security signoff packet missing required token: {token}"));
        }

        violations.Should().BeEmpty("v1.0.0 security signoff must have an auditable self-assessment packet even before the human signer closes it");
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
                "Evidence",
                "[DateTimeOffset]::Parse",
                "VerifiedAt must be a parseable timestamp",
                "VerifiedAt must not be in the future.",
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
                "Evidence cannot be a placeholder",
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
    public void ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence()
    {
        var repositoryRoot = FindRepositoryRoot();
        var scriptPath = Path.Combine(repositoryRoot, "scripts/run-release-gate-audit.ps1");
        var reportPath = Path.Combine(repositoryRoot, "_docs/_reports/release-gate-audit-20260602.md");
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
                "staging-rehearsal",
                "attack-chain-verification",
                "security-signoff",
                "20260602-security-signoff",
                "gray-observation",
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
            violations.Add("_docs/_reports/release-gate-audit-20260602.md is required to summarize all current B-track release blockers.");
        }
        else
        {
            var report = File.ReadAllText(reportPath);
            var requiredReportTokens = new[]
            {
                "Hosted CI",
                "PostgreSQL/staging",
                "Attack Chain A/B/C",
                "Security signoff",
                "20260602-security-signoff",
                "Gray observation",
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
            "Evidence cannot be a placeholder"
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
            "PENDING",
            "UNSIGNED",
            "FAIL"
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
            "Test-SectionExitCodeZero $Text \"Start API\""
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
            "Test-SectionContainsNumberToken $Text \"gh run\" $runId"
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
            "Evidence cannot be a placeholder",
            "GrayStartedAt must not be after ObservationStartedAt.",
            "ObservationEndedAt must not be in the future.",
            "UtcNow"
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

        if (!script.Contains("Get-AnchoredLineValues $lines \"Evidence\" | Where-Object { Test-RealEvidence $_ }", StringComparison.Ordinal))
        {
            violations.Add("Release gate audit must reject placeholder gray observation evidence.");
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
