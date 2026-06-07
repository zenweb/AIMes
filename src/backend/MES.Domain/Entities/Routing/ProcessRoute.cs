using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Routing;

public class ProcessRoute : AggregateRoot
{
    public string RouteCode { get; private set; } = string.Empty;
    public string RouteName { get; private set; } = string.Empty;
    public ProductCode ProductCode { get; private set; } = new(string.Empty);
    public string ProductName { get; private set; } = string.Empty;
    public new string Version { get; private set; } = string.Empty;
    public RouteStatus Status { get; private set; } = RouteStatus.Draft;
    public List<RoutingStep> Steps { get; private set; } = new();
    public double? TotalLeadTimeMinutes { get; private set; }

    private ProcessRoute() { }

    public ProcessRoute(string routeCode, string routeName, ProductCode productCode, string productName, string version)
    {
        RouteCode = routeCode;
        RouteName = routeName;
        ProductCode = productCode;
        ProductName = productName;
        Version = version;
    }

    public void AddStep(RoutingStep step)
    {
        Steps.Add(step);
        Steps = Steps.OrderBy(s => s.StepSequence).ToList();
    }

    public void RemoveStep(string stepId)
    {
        Steps.RemoveAll(s => s.Id == stepId);
        ReorderSteps(Steps.OrderBy(s => s.StepSequence).Select(s => s.Id).ToList());
    }

    public void ReorderSteps(IReadOnlyList<string> orderedStepIds)
    {
        var stepsById = Steps.ToDictionary(s => s.Id);
        for (var index = 0; index < orderedStepIds.Count; index++)
        {
            if (stepsById.TryGetValue(orderedStepIds[index], out var step))
            {
                step.SetSequence(index + 1);
            }
        }
    }
}
