using FluentValidation;
using MES.Api.Endpoints;
using MES.Application.DTOs;
using MES.Domain.Enums;

namespace MES.Api.Validators;

public class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestDtoValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreateWorkOrderRequestValidator : AbstractValidator<CreateWorkOrderRequest>
{
    public CreateWorkOrderRequestValidator()
    {
        RuleFor(x => x.OrderNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProductCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PlannedQuantity).GreaterThan(0);
        RuleFor(x => x.WorkshopId).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RouteCode).MaximumLength(50);
        RuleFor(x => x.Priority).InclusiveBetween(0, 100);
        RuleFor(x => x.PlannedStartDate).LessThan(x => x.PlannedEndDate)
            .When(x => x.PlannedStartDate != default && x.PlannedEndDate != default)
            .WithMessage("计划开始日期必须早于计划结束日期");
    }
}

public class OptimizeScheduleRequestValidator : AbstractValidator<OptimizeScheduleRequest>
{
    public OptimizeScheduleRequestValidator()
    {
        RuleFor(x => x.WorkshopId).NotEmpty().MaximumLength(50);
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("结束日期必须晚于开始日期");
        RuleForEach(x => x.WorkOrderIds).NotEmpty().MaximumLength(50)
            .When(x => x.WorkOrderIds != null);
    }
}

public class CreateInspectionRequestValidator : AbstractValidator<CreateInspectionRequest>
{
    public CreateInspectionRequestValidator()
    {
        RuleFor(x => x.WorkOrderId).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProductCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProcessName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.InspectionPoint).NotEmpty().MaximumLength(100);
        RuleFor(x => x.InspectionQuantity).GreaterThan(0);
        RuleFor(x => x.QualifiedQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DefectQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.InspectorId).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Result).NotEmpty().Must(value => Enum.TryParse<InspectionResult>(value, true, out _))
            .WithMessage("检验结果无效");
        RuleFor(x => x).Must(x => x.QualifiedQuantity + x.DefectQuantity == x.InspectionQuantity)
            .WithMessage("合格数量与不良数量之和必须等于检验数量");
    }
}

public class CreateEquipmentRequestValidator : AbstractValidator<CreateEquipmentRequest>
{
    public CreateEquipmentRequestValidator()
    {
        RuleFor(x => x.EquipmentCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.EquipmentName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EquipmentType).MaximumLength(50);
        RuleFor(x => x.WorkshopId).NotEmpty().MaximumLength(50);
        RuleFor(x => x.WorkshopName).MaximumLength(200);
        RuleFor(x => x.Capacity).GreaterThanOrEqualTo(0);
    }
}

public class UpdateEquipmentStatusRequestValidator : AbstractValidator<UpdateEquipmentStatusRequest>
{
    public UpdateEquipmentStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty().Must(value => Enum.TryParse<EquipmentStatus>(value, true, out _))
            .WithMessage("设备状态无效");
    }
}

public class DiagnoseRequestValidator : AbstractValidator<DiagnoseRequest>
{
    public DiagnoseRequestValidator()
    {
        RuleFor(x => x.ErrorCode).MaximumLength(100);
    }
}

public class UpdateStatusRequestValidator : AbstractValidator<UpdateStatusRequest>
{
    public UpdateStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty().Must(value => Enum.TryParse<WorkOrderStatus>(value, true, out _))
            .WithMessage("工单状态无效");
    }
}

public class KnowledgeQueryRequestValidator : AbstractValidator<KnowledgeQueryRequest>
{
    public KnowledgeQueryRequestValidator()
    {
        RuleFor(x => x.Question).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.SessionId).MaximumLength(50);
        RuleFor(x => x.TopK).InclusiveBetween(1, 20);
    }
}
