using MES.AI.Core.Scheduling;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Adapters;

public class AdoptionFeedbackAdapter : IAdoptionFeedbackService
{
    private readonly AdoptionFeedbackService _inner;

    public AdoptionFeedbackAdapter(AdoptionFeedbackService inner)
    {
        _inner = inner;
    }

    public ScheduleAdoptionFeedback RecordOverride(
        string schedulePlanId,
        string workshopId,
        string optimizationObjective,
        OverrideReasonCategory reasonCategory,
        string? reasonDetail,
        List<string>? movedOrderIds,
        string operatorUser,
        string? aiTraceId = null)
    {
        return _inner.RecordOverride(
            schedulePlanId,
            workshopId,
            optimizationObjective,
            [],
            [],
            reasonCategory,
            reasonDetail,
            movedOrderIds,
            operatorUser,
            aiTraceId);
    }
}
