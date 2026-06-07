using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MES.Api.Hubs;

[Authorize]
public partial class NotificationHub : Hub
{
    private static readonly HashSet<string> ReservedChannels = ["all", "Admin", "Operator", "Lead", "Engineer"];
    private static readonly string[] AllowedPrefixes = ["equipment:", "order:", "anomaly:", "quality:", "material:"];
    private static readonly Dictionary<string, string[]> ChannelRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        ["equipment:"] = ["Admin", "Engineer", "Maintenance"],
        ["order:"] = ["Admin", "Operator", "Lead", "Planner"],
        ["anomaly:"] = ["Admin", "Operator", "Lead", "Engineer", "Maintenance", "QC", "Quality"],
        ["quality:"] = ["Admin", "QC", "Quality", "Engineer"],
        ["material:"] = ["Admin", "Purchase", "Planner"],
    };

    [GeneratedRegex(@"^[a-zA-Z][\w-]+:[\w-]+$")]
    private static partial Regex ChannelPattern();

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
    /// 客户端订阅实体频道（equipment:* / order:* / anomaly:* / quality:* / material:*）
    /// </summary>
    public async Task Subscribe(string channel)
    {
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (!CanSubscribeToChannel(channel, role, out var message))
        {
            throw new HubException(message);
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, channel);
    }

    public async Task Unsubscribe(string channel)
    {
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (!CanSubscribeToChannel(channel, role, out _))
        {
            throw new HubException("无效的频道名称");
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, channel);
    }

    public static bool CanSubscribeToChannel(string channel, string? role, out string message)
    {
        if (ReservedChannels.Contains(channel))
        {
            message = "不允许订阅系统保留频道";
            return false;
        }

        if (!ChannelPattern().IsMatch(channel))
        {
            message = "频道名称格式无效，应使用 entity_type:id 格式";
            return false;
        }

        if (!AllowedPrefixes.Any(p => channel.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            message = $"不允许订阅该频道类型，允许的前缀: {string.Join(", ", AllowedPrefixes)}";
            return false;
        }

        if (string.IsNullOrWhiteSpace(role))
        {
            message = "无法识别订阅者角色";
            return false;
        }

        var prefix = AllowedPrefixes.First(p => channel.StartsWith(p, StringComparison.OrdinalIgnoreCase));
        if (!ChannelRoles[prefix].Contains(role, StringComparer.OrdinalIgnoreCase))
        {
            message = "当前角色无权订阅该频道";
            return false;
        }

        message = "";
        return true;
    }
}
