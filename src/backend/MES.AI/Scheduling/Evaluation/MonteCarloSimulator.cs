namespace MES.AI.Core.Scheduling.Evaluation;

using MES.AI.Core.Models;

public sealed class MonteCarloSimulator
{
    public IReadOnlyList<ScheduleRequest> Perturb(ScheduleRequest request, int seed, int runs)
    {
        var random = new Random(seed);
        var result = new List<ScheduleRequest>();

        for (var i = 0; i < runs; i++)
        {
            result.Add(CloneWithPerturbation(request, random));
        }

        return result;
    }

    public MonteCarloResult Summarize(IEnumerable<double> values)
    {
        var samples = values.ToList();
        if (samples.Count == 0)
        {
            return new MonteCarloResult(0, 0, 0, 0, 0);
        }

        var mean = samples.Average();
        var variance = samples.Count == 1
            ? 0
            : samples.Sum(value => Math.Pow(value - mean, 2)) / (samples.Count - 1);
        var standardDeviation = Math.Sqrt(variance);
        var margin = 1.96 * standardDeviation / Math.Sqrt(samples.Count);

        return new MonteCarloResult(
            Math.Round(mean, 4),
            Math.Round(standardDeviation, 4),
            Math.Round(mean - margin, 4),
            Math.Round(mean + margin, 4),
            samples.Count);
    }

    private static ScheduleRequest CloneWithPerturbation(ScheduleRequest request, Random random)
    {
        var orders = request.Orders.Select(order =>
        {
            var dueShiftHours = random.Next(-8, 25);
            var quantityFactor = 0.9 + random.NextDouble() * 0.2;
            return new WorkOrderInfo
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                ProductCode = order.ProductCode,
                Quantity = Math.Max(1, (int)Math.Round(order.Quantity * quantityFactor)),
                DueDate = order.DueDate.AddHours(dueShiftHours),
                Priority = order.Priority,
                RouteCode = order.RouteCode
            };
        }).ToList();

        return new ScheduleRequest
        {
            WorkshopId = request.WorkshopId,
            Orders = orders,
            Equipment = request.Equipment.Select(e => new EquipmentCapacity
            {
                Id = e.Id,
                EquipmentCode = e.EquipmentCode,
                Capacity = e.Capacity,
                Type = e.Type
            }).ToList(),
            Materials = new Dictionary<string, int>(request.Materials),
            Deadlines = orders.ToDictionary(o => o.Id, o => o.DueDate),
            HistoricalData = request.HistoricalData,
            OptimizationObjective = request.OptimizationObjective,
            LockedOrderIds = request.LockedOrderIds.ToList()
        };
    }
}

public sealed record MonteCarloResult(
    double Mean,
    double StdDev,
    double Confidence95Lower,
    double Confidence95Upper,
    int SampleCount);
