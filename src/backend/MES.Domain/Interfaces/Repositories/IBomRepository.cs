using MES.Domain.Entities.Bom;
using MES.Domain.ValueObjects;

namespace MES.Domain.Interfaces.Repositories;

public interface IBomRepository
{
    Task<BillOfMaterial?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<BillOfMaterial>> GetByProductCodeAsync(ProductCode productCode, CancellationToken ct = default);
    Task<BillOfMaterial?> GetByBomCodeAsync(string bomCode, CancellationToken ct = default);
    Task<BillOfMaterial> AddAsync(BillOfMaterial bom, CancellationToken ct = default);
    Task<BillOfMaterial> UpdateAsync(BillOfMaterial bom, CancellationToken ct = default);
}
