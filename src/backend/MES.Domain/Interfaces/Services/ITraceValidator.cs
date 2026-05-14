using MES.Domain.ValueObjects;

namespace MES.Domain.Interfaces.Services;

public interface ITraceValidator
{
    (bool IsValid, List<string> Errors) Validate(AiDecisionTrace? trace);
}
