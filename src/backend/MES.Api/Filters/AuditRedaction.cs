using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MES.Api.Filters;

/// <summary>
/// 审计日志的敏感字段过滤器。
/// 在序列化进 AuditLog.NewValues 之前，把字段名命中 PII 模式的值替换为 ***REDACTED***，
/// 防止密码 / token / 密钥等被 SELECT 出来泄漏。
/// </summary>
internal static class AuditRedaction
{
    private static readonly Regex SensitiveFieldPattern = new(
        @"password|secret|token|apikey|api_key|signingkey|signing_key|credential|^pwd$|passwd|hash|cert|privatekey|private_key",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private const string RedactedMarker = "***REDACTED***";
    private const string CycleMarker = "***CYCLE***";
    private const int MaxDepth = 6;

    /// <summary>
    /// 对参数列表做 PII redact 后序列化为 JSON。
    /// 每个参数会被深度遍历（属性 + 字段），命中敏感名的字符串值会被替换。
    /// 对循环引用（EF 实体的 parent/child 关系常见）通过 visited set 短路，
    /// 避免后续 JsonSerializer.Serialize 抛 cycle 异常导致审计写入失败。
    /// </summary>
    public static string? RedactAndSerialize(IEnumerable<object?> arguments)
    {
        var visited = new HashSet<object>(ReferenceEqualityComparer.Instance);
        var redacted = arguments
            .Select(arg => RedactObject(arg, depth: 0, visited))
            .ToList();

        return redacted.Count == 0 ? null : JsonSerializer.Serialize(redacted);
    }

    private static object? RedactObject(object? value, int depth, HashSet<object> visited)
    {
        if (value is null || depth > MaxDepth)
        {
            return value;
        }

        var type = value.GetType();

        if (IsSimpleType(type))
        {
            return value;
        }

        // 引用类型 cycle 检测：同一对象在当前调用链中已访问过则短路
        if (!type.IsValueType && !visited.Add(value))
        {
            return CycleMarker;
        }

        try
        {
            if (value is System.Collections.IEnumerable enumerable && value is not string)
            {
                var list = new List<object?>();
                foreach (var item in enumerable)
                {
                    list.Add(RedactObject(item, depth + 1, visited));
                }
                return list;
            }

            var dict = new Dictionary<string, object?>();
            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!prop.CanRead || prop.GetIndexParameters().Length > 0)
                {
                    continue;
                }

                object? propValue;
                try
                {
                    propValue = prop.GetValue(value);
                }
                catch
                {
                    continue;
                }

                dict[prop.Name] = SensitiveFieldPattern.IsMatch(prop.Name)
                    ? (propValue is null ? null : RedactedMarker)
                    : RedactObject(propValue, depth + 1, visited);
            }

            return dict;
        }
        finally
        {
            // 出栈时移除，让兄弟分支的合法重复引用不被误判为 cycle
            if (!type.IsValueType)
            {
                visited.Remove(value);
            }
        }
    }

    private static bool IsSimpleType(Type type)
    {
        if (type.IsPrimitive || type.IsEnum)
        {
            return true;
        }

        return type == typeof(string)
            || type == typeof(decimal)
            || type == typeof(DateTime)
            || type == typeof(DateTimeOffset)
            || type == typeof(TimeSpan)
            || type == typeof(Guid)
            || (Nullable.GetUnderlyingType(type) is Type underlying && IsSimpleType(underlying));
    }
}
