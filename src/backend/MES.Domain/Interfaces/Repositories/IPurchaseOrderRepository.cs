using MES.Domain.Entities.Purchase;

namespace MES.Domain.Interfaces.Repositories;

public interface IPurchaseOrderRepository
{
    Task<List<PurchaseOrder>> GetAllAsync(CancellationToken ct = default);
    Task<List<PurchaseOrder>> GetPagedAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<PurchaseOrder?> GetByIdAsync(string id, CancellationToken ct = default);
    Task AddAsync(PurchaseOrder order, CancellationToken ct = default);
    Task UpdateAsync(PurchaseOrder order, CancellationToken ct = default);
    Task<bool> ExistsAsync(string id, CancellationToken ct = default);
}
