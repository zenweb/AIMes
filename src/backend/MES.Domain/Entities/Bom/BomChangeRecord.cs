using MES.Domain.Primitives;

namespace MES.Domain.Entities.Bom;

public class BomChangeRecord : Entity
{
    public string ChangeDescription { get; private set; } = string.Empty;
    public string ChangedBy { get; private set; } = string.Empty;
    public DateTime ChangedAt { get; private set; } = DateTime.UtcNow;

    private BomChangeRecord() { }

    public BomChangeRecord(string changeDescription, string changedBy)
    {
        ChangeDescription = changeDescription;
        ChangedBy = changedBy;
    }
}
