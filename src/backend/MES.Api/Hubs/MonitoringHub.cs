using MES.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MES.Api.Hubs;

[Authorize]
public class MonitoringHub(IMonitoringSubscriberTracker subscriberTracker) : Hub
{
    public override async Task OnConnectedAsync()
    {
        subscriberTracker.Connected();
        await Groups.AddToGroupAsync(Context.ConnectionId, "monitoring");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "monitoring");
        subscriberTracker.Disconnected();
        await base.OnDisconnectedAsync(exception);
    }
}
