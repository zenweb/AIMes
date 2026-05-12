using MES.Domain.ValueObjects;

namespace MES.AI.Services;

public interface ITraceValidator
{
    (bool IsValid, List<string> Errors) Validate(AiDecisionTrace? trace);
}
