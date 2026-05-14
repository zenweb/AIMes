using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Routing;

public class RoutingStep : Entity
{
    public int StepSequence { get; private set; }
    public OperationCode OperationCode { get; private set; } = new(string.Empty);
    public string OperationName { get; private set; } = string.Empty;
    public string WorkstationType { get; private set; } = string.Empty;
    public double StandardSetupMinutes { get; private set; }
    public double StandardRunMinutesPerUnit { get; private set; }
    public string EquipmentType { get; private set; } = string.Empty;
    public bool InspectionRequired { get; private set; }
    public List<StepParameter> Parameters { get; private set; } = new();

    private RoutingStep() { }

    public RoutingStep(int stepSequence, OperationCode operationCode, string operationName, string workstationType)
    {
        StepSequence = stepSequence;
        OperationCode = operationCode;
        OperationName = operationName;
        WorkstationType = workstationType;
    }

    public void SetSequence(int sequence)
    {
        StepSequence = sequence;
    }
}
