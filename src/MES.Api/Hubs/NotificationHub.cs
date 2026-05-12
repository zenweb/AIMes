using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MES.Api.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (!string.IsNullOrEmpty(role))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, role);
        }

        // 所有用户加入 "all" 组
        await Groups.AddToGroupAsync(Context.ConnectionId, "all");

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// 客户端可以加入指定设备/工单的频道
    /// </summary>
    public async Task Subscribe(string channel)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, channel);
    }

    public async Task Unsubscribe(string channel)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, channel);
    }
}
