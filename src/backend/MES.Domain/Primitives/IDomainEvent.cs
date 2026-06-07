namespace MES.Domain.Primitives;

/// <summary>
/// 领域事件标记接口。所有领域事件实现此接口。
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
