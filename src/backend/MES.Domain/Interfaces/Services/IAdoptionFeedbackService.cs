using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Services;

public interface IAdoptionFeedbackService
{
    ScheduleAdoptionFeedback RecordOverride(
        string schedulePlanId,
        string workshopId,
        string optimizationObjective,
        OverrideReasonCategory reasonCategory,
        string? reasonDetail,
        List<string>? movedOrderIds,
        string operatorUser,
        string? aiTraceId = null);
}
