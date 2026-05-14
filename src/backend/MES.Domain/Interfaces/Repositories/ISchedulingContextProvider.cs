using MES.Domain.Entities.Scheduling;
using MES.Domain.Events;

namespace MES.Domain.Interfaces.Repositories;

public interface ISchedulingContextProvider
{
    Task<SchedulingContextSnapshot> GetContextAsync(string workshopId, CancellationToken ct = default);

    Task UpdateCacheAsync(string workshopId, string snapshotType, object data);

    Task HandleOperationReportedAsync(OperationReported domainEvent, CancellationToken ct = default);

    Task HandleSchedulePlanCreatedAsync(SchedulePlanCreated domainEvent, CancellationToken ct = default);
}
