using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.AI.Pro.Agents;
using Moq;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

/// <summary>
/// 质量应用服务测试
/// </summary>
public class QualityAppServiceTests
{
    private readonly Mock<IQualityInspectionRepository> _inspectionRepoMock;
    private readonly Mock<IWorkOrderRepository> _workOrderRepoMock;
    private readonly QualityAppService _sut;

    public QualityAppServiceTests()
    {
        _inspectionRepoMock = new Mock<IQualityInspectionRepository>();
        _workOrderRepoMock = new Mock<IWorkOrderRepository>();
        _sut = new QualityAppService(
            _inspectionRepoMock.Object,
            _workOrderRepoMock.Object,
            null!); // QualityAgent需要mock
    }

    [Fact]
    public async Task CreateInspectionAsync_ShouldCreateInspectionWithCorrectProperties()
    {
        // Arrange
        var request = new CreateInspectionRequest
        {
            WorkOrderId = "WO-001",
            ProductCode = "PROD-001",
            ProcessName = "Machining",
            InspectionPoint = "Dimension Check",
            InspectionQuantity = 100,
            QualifiedQuantity = 95,
            DefectQuantity = 5,
            Result = "Pass",
            InspectorId = "INS-001"
        };

        _inspectionRepoMock.Setup(r => r.CreateAsync(It.IsAny<QualityInspection>()))
            .ReturnsAsync((QualityInspection i) => i);

        // Act
        var result = await _sut.CreateInspectionAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.WorkOrderId.Should().Be("WO-001");
        result.ProductCode.Should().Be("PROD-001");
        result.InspectionQuantity.Should().Be(100);
        result.QualifiedQuantity.Should().Be(95);
        result.DefectQuantity.Should().Be(5);
        result.PassRate.Should().BeApproximately(95.0, 0.01);

        _inspectionRepoMock.Verify(r => r.CreateAsync(It.IsAny<QualityInspection>()), Times.Once);
    }

    [Fact]
    public async Task GetInspectionByIdAsync_WhenExists_ShouldReturnInspection()
    {
        // Arrange
        var inspection = new QualityInspection
        {
            Id = "insp-001",
            WorkOrderId = "WO-001",
            ProductCode = "PROD-001",
            InspectionQuantity = 100,
            QualifiedQuantity = 95
        };

        _inspectionRepoMock.Setup(r => r.GetByIdAsync("insp-001"))
            .ReturnsAsync(inspection);

        // Act
        var result = await _sut.GetInspectionByIdAsync("insp-001");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("insp-001");
        result.WorkOrderId.Should().Be("WO-001");
    }

    [Fact]
    public async Task GetInspectionByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        // Arrange
        _inspectionRepoMock.Setup(r => r.GetByIdAsync("non-existent"))
            .ReturnsAsync((QualityInspection?)null);

        // Act
        var result = await _sut.GetInspectionByIdAsync("non-existent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetStatisticsAsync_ShouldReturnCorrectStatistics()
    {
        // Arrange
        var inspections = new List<QualityInspection>
        {
            new() { Result = InspectionResult.Pass, ProductCode = "PROD-001" },
            new() { Result = InspectionResult.Pass, ProductCode = "PROD-001" },
            new() { Result = InspectionResult.Fail, ProductCode = "PROD-001" },
            new() { Result = InspectionResult.Rework, ProductCode = "PROD-001" }
        };

        _inspectionRepoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(inspections);

        // Act
        var result = await _sut.GetStatisticsAsync("PROD-001");

        // Assert
        result.TotalInspections.Should().Be(4);
        result.PassedCount.Should().Be(2);
        result.FailedCount.Should().Be(1);
        result.ReworkCount.Should().Be(1);
        result.PassRate.Should().BeApproximately(50.0, 0.01);
        result.DefectRate.Should().BeApproximately(25.0, 0.01);
    }

    [Fact]
    public async Task GetInspectionsByWorkOrderAsync_ShouldReturnInspectionsForWorkOrder()
    {
        // Arrange
        var inspections = new List<QualityInspection>
        {
            new() { Id = "insp-001", WorkOrderId = "WO-001" },
            new() { Id = "insp-002", WorkOrderId = "WO-001" }
        };

        _inspectionRepoMock.Setup(r => r.GetByWorkOrderAsync("WO-001"))
            .ReturnsAsync(inspections);

        // Act
        var result = await _sut.GetInspectionsByWorkOrderAsync("WO-001");

        // Assert
        result.Should().HaveCount(2);
        result.All(i => i.WorkOrderId == "WO-001").Should().BeTrue();
    }
}
