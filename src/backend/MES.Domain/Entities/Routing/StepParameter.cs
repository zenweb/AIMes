using MES.Domain.Primitives;

namespace MES.Domain.Entities.Routing;

public class StepParameter : ValueObject
{
    public string ParameterCode { get; private set; } = string.Empty;
    public string ParameterName { get; private set; } = string.Empty;
    public string DefaultValue { get; private set; } = string.Empty;
    public string Unit { get; private set; } = string.Empty;
    public double? UpperLimit { get; private set; }
    public double? LowerLimit { get; private set; }
    public bool IsMandatory { get; private set; }

    private StepParameter() { }

    public StepParameter(string parameterCode, string parameterName, string defaultValue, string unit, double? upperLimit, double? lowerLimit, bool isMandatory)
    {
        ParameterCode = parameterCode;
        ParameterName = parameterName;
        DefaultValue = defaultValue;
        Unit = unit;
        UpperLimit = upperLimit;
        LowerLimit = lowerLimit;
        IsMandatory = isMandatory;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return ParameterCode;
        yield return ParameterName;
        yield return DefaultValue;
        yield return Unit;
        yield return UpperLimit ?? 0;
        yield return LowerLimit ?? 0;
        yield return IsMandatory;
    }
}
