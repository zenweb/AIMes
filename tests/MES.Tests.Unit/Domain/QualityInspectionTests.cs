using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// 质量检验实体测试
/// </summary>
public class QualityInspectionTests
{
    [Fact]
    public void QualityInspection_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var inspection = new QualityInspection();

        // Assert
        inspection.Id.Should().NotBeNullOrEmpty();
        inspection.WorkOrderId.Should().BeEmpty();
        inspection.ProductCode.Should().BeEmpty();
        inspection.ProcessName.Should().BeEmpty();
        inspection.InspectionPoint.Should().BeEmpty();
        inspection.InspectionQuantity.Should().Be(0);
        inspection.QualifiedQuantity.Should().Be(0);
        inspection.DefectQuantity.Should().Be(0);
        inspection.Result.Should().Be(InspectionResult.Pass);
        inspection.Defects.Should().NotBeNull();
        inspection.MeasurementData.Should().NotBeNull();
    }

    [Fact]
    public void QualityInspection_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        // Act
        var inspection = new QualityInspection
        {
            Id = id,
            WorkOrderId = "WO-001",
            ProductCode = "PROD-001",
            ProcessName = "Machining",
            InspectionPoint = "Dimension Check",
            InspectionQuantity = 100,
            QualifiedQuantity = 95,
            DefectQuantity = 5,
            Result = InspectionResult.Pass,
            InspectorId = "INS-001",
            InspectedAt = now
        };

        // Assert
        inspection.Id.Should().Be(id);
        inspection.WorkOrderId.Should().Be("WO-001");
        inspection.InspectionQuantity.Should().Be(100);
        inspection.QualifiedQuantity.Should().Be(95);
        inspection.DefectQuantity.Should().Be(5);
        inspection.Result.Should().Be(InspectionResult.Pass);
    }

    [Theory]
    [InlineData(InspectionResult.Pass)]
    [InlineData(InspectionResult.Fail)]
    [InlineData(InspectionResult.Rework)]
    [InlineData(InspectionResult.Scrap)]
    public void QualityInspection_ShouldAcceptAllValidResults(InspectionResult result)
    {
        // Arrange & Act
        var inspection = new QualityInspection { Result = result };

        // Assert
        inspection.Result.Should().Be(result);
    }

    [Fact]
    public void QualityInspection_DefectsShouldBeModifiable()
    {
        // Arrange
        var inspection = new QualityInspection();

        // Act
        inspection.Defects.Add(new DefectRecord
        {
            DefectType = "Scratch",
            Quantity = 3,
            AreaRatio = 0.05,
            Severity = "Minor"
        });

        // Assert
        inspection.Defects.Should().HaveCount(1);
        inspection.Defects[0].DefectType.Should().Be("Scratch");
    }

    [Fact]
    public void QualityInspection_MeasurementDataShouldBeModifiable()
    {
        // Arrange
        var inspection = new QualityInspection();

        // Act
        inspection.MeasurementData["Length"] = 100.5;
        inspection.MeasurementData["Width"] = 50.2;

        // Assert
        inspection.MeasurementData.Should().ContainKey("Length");
        inspection.MeasurementData["Length"].Should().Be(100.5);
    }
}
