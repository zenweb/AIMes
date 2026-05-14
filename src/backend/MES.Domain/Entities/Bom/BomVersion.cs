using MES.Domain.Primitives;

namespace MES.Domain.Entities.Bom;

public class BomVersion : Entity
{
    public string Version { get; private set; } = string.Empty;
    public BomVersionStatus Status { get; private set; } = BomVersionStatus.Draft;
    public string ChangeDescription { get; private set; } = string.Empty;
    public string ApprovedBy { get; private set; } = string.Empty;
    public DateTime? ApprovedAt { get; private set; }

    private BomVersion() { }

    public BomVersion(string version, BomVersionStatus status, string changeDescription, string approvedBy = "", DateTime? approvedAt = null)
    {
        Version = version;
        Status = status;
        ChangeDescription = changeDescription;
        ApprovedBy = approvedBy;
        ApprovedAt = approvedAt;
    }
}
