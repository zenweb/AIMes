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
    /// 乐观并发控制版本。
    /// 不在此处加 [ConcurrencyCheck]：基础设施层的 EntityTypeConfiguration 用
    /// IsConcurrencyToken() + ValueGeneratedOnAddOrUpdate() + HasColumnName("xmin")
    /// 显式映射到 PostgreSQL xmin 系统列（避免 BillOfMaterial/ProcessRoute 用 `new string Version`
    /// 影子化基类时引发 EF 模型扫描冲突）。
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
