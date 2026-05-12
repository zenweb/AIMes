using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Bom;

public class BomItem : Entity
{
    public MaterialCode MaterialCode { get; private set; } = new(string.Empty);
    public string MaterialName { get; private set; } = string.Empty;
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public decimal? LossRate { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public string ConsumptionTiming { get; private set; } = string.Empty;
    public int Sequence { get; private set; }
    public List<BomItem> Children { get; private set; } = new();

    private BomItem() { }

    public BomItem(
        MaterialCode materialCode,
        string materialName,
        decimal quantity,
        string unit,
        int sequence,
        decimal? lossRate = null,
        int? leadTimeDays = null,
        string consumptionTiming = "")
    {
        MaterialCode = materialCode;
        MaterialName = materialName;
        Quantity = quantity;
        Unit = unit;
        Sequence = sequence;
        LossRate = lossRate;
        LeadTimeDays = leadTimeDays;
        ConsumptionTiming = consumptionTiming;
    }

    public void AddChild(BomItem child)
    {
        Children.Add(child);
    }
}
