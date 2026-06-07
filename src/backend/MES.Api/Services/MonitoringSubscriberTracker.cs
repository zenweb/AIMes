namespace MES.Api.Services;

public interface IMonitoringSubscriberTracker
{
    int SubscriberCount { get; }

    bool HasSubscribers { get; }

    void Connected();

    void Disconnected();
}

public sealed class MonitoringSubscriberTracker : IMonitoringSubscriberTracker
{
    private int _subscriberCount;

    public int SubscriberCount => Volatile.Read(ref _subscriberCount);

    public bool HasSubscribers => SubscriberCount > 0;

    public void Connected()
    {
        Interlocked.Increment(ref _subscriberCount);
    }

    public void Disconnected()
    {
        var newValue = Interlocked.Decrement(ref _subscriberCount);
        if (newValue < 0)
        {
            Interlocked.Exchange(ref _subscriberCount, 0);
        }
    }
}
