using MES.Domain.Entities.Admin;

namespace MES.Domain.Interfaces.Repositories;

public interface INotificationConfigRepository
{
    Task<List<NotificationConfig>> GetAllAsync(CancellationToken ct = default);
    Task<NotificationConfig?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<NotificationConfig> UpdateAsync(NotificationConfig config, CancellationToken ct = default);
}
