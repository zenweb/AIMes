namespace MES.Domain.Enums;

/// <summary>
/// 设备状态
/// </summary>
public enum EquipmentStatus
{
    Available = 0,
    Running = 1,
    Idle = 2,
    Maintenance = 3,
    Fault = 4,
    Offline = 5
}
