namespace MES.AI.Scheduling;

using MES.AI.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>硬约束验证器接口</summary>
public interface IConstraintValidator
{
    /// <summary>验证排产方案是否满足所有硬约束</summary>
    ConstraintValidationResult Validate(
        List<ScheduleAssignment> assignments,
        ScheduleRequest request,
        SchedulingContextSnapshot context);
}
