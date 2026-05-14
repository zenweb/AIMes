using FluentAssertions;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
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
    public void QualityInspection_ShouldCreateViaFactory()
    {
        // Arrange
        var now = DateTime.UtcNow;

        // Act
        var inspection = QualityInspection.Create("WO-001", "PROD-001", "Machining",
            "Dimension Check", 100, 100, 0, "INS-001");

        // Assert
        inspection.WorkOrderId.Should().Be("WO-001");
        inspection.InspectionQuantity.Should().Be(100);
        inspection.QualifiedQuantity.Should().Be(100);
        inspection.DefectQuantity.Should().Be(0);
        inspection.Result.Should().Be(InspectionResult.Pass);
    }

    [Theory]
    [InlineData(InspectionResult.Pass)]
    [InlineData(InspectionResult.Fail)]
    [InlineData(InspectionResult.Rework)]
    [InlineData(InspectionResult.Scrap)]
    public void QualityInspection_ShouldReportDefectForAllResults(InspectionResult result)
    {
        // Arrange
        var inspection = QualityInspection.Create("WO-001", "PROD-001", "Machining",
            "Check", 100, 95, 5, "INS-001", result);

        // Act
        inspection.RecordDefect("Scratch", 3, 0.05, "Minor", "Polish surface");

        // Assert
        inspection.Defects.Should().HaveCount(1);
        inspection.Defects[0].DefectType.Should().Be("Scratch");
    }

    [Fact]
    public void QualityInspection_ShouldRecordDefect()
    {
        // Arrange
        var inspection = QualityInspection.Create("WO-001", "PROD-001", "Machining",
            "Check", 100, 100, 0, "INS-001");

        // Act
        inspection.RecordDefect("Scratch", 3, 0.05, "Minor");

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
