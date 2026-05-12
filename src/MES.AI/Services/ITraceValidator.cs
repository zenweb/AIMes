using MES.Domain.ValueObjects;

namespace MES.AI.Pro.Services;

public interface ITraceValidator
{
    (bool IsValid, List<string> Errors) Validate(AiDecisionTrace? trace);
}
