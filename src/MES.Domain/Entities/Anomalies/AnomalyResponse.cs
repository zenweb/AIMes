using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Anomalies;

public class AnomalyResponse : Entity
{
    public AnomalyResponseType ResponseType { get; private set; } = AnomalyResponseType.Manual;
    public string Description { get; private set; } = string.Empty;
    public string SuggestedAction { get; private set; } = string.Empty;
    public string SuggestedBy { get; private set; } = string.Empty;
    public AnomalyResponseStatus Status { get; private set; } = AnomalyResponseStatus.Pending;
    public DateTime? ExecutedAt { get; private set; }
    public string? ExecutedBy { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public AiDecisionTrace? AiDecisionTrace { get; private set; }

    private AnomalyResponse() { }

    public AnomalyResponse(AnomalyResponseType responseType, string description, string suggestedAction, string suggestedBy, AiDecisionTrace? aiDecisionTrace = null)
    {
        ResponseType = responseType;
        Description = description;
        SuggestedAction = suggestedAction;
        SuggestedBy = suggestedBy;
        AiDecisionTrace = aiDecisionTrace;
    }

    public void MarkExecuted(string executedBy)
    {
        Status = AnomalyResponseStatus.Executed;
        ExecutedBy = executedBy;
        ExecutedAt = DateTime.UtcNow;
    }
}
