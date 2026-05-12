namespace MES.Domain.Primitives;

/// <summary>
/// 聚合根基类。每个聚合根有自己的 Id 和版本；领域事件集合管理。
/// </summary>
public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = new();

    /// <summary>
    /// 聚合根唯一标识。子类用 new 或构造函数赋值。
    /// </summary>
    public string Id { get; protected set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// 乐观并发控制版本（EF Core 可映射为 concurrency token）。
    /// </summary>
    public uint Version { get; protected set; }

    /// <summary>
    /// 只读领域事件集合。
    /// </summary>
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    /// <summary>
    /// 向内部事件列表添加领域事件。
    /// </summary>
    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    /// <summary>
    /// 清空并返回已积累的领域事件（供基础设施层派发）。
    /// </summary>
    public List<IDomainEvent> PopDomainEvents()
    {
        var events = new List<IDomainEvent>(_domainEvents);
        _domainEvents.Clear();
        return events;
    }
}