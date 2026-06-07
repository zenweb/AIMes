using System.ComponentModel.DataAnnotations;

namespace MES.Api.Configuration;

public sealed class MessagingOptions
{
    public const string SectionName = "Messaging";
    public const string DisabledTransport = "Disabled";
    public const string InMemoryTransport = "InMemory";
    public const string RabbitMqTransport = "RabbitMQ";

    [Required]
    public string Transport { get; set; } = RabbitMqTransport;

    public string RabbitMqConnection { get; set; } = string.Empty;

    public bool IsDisabled => string.Equals(Transport, DisabledTransport, StringComparison.OrdinalIgnoreCase);

    public bool IsInMemory => string.Equals(Transport, InMemoryTransport, StringComparison.OrdinalIgnoreCase);

    public bool IsRabbitMq => string.Equals(Transport, RabbitMqTransport, StringComparison.OrdinalIgnoreCase);

    public static void BindFromConfiguration(MessagingOptions options, IConfiguration configuration)
    {
        configuration.GetSection(SectionName).Bind(options);
        options.RabbitMqConnection = configuration.GetConnectionString("RabbitMQ") ?? string.Empty;
    }

    public static bool HasSupportedTransport(MessagingOptions options)
    {
        return options.IsDisabled || options.IsInMemory || options.IsRabbitMq;
    }

    public static bool HasRequiredConnection(MessagingOptions options)
    {
        return !options.IsRabbitMq || !string.IsNullOrWhiteSpace(options.RabbitMqConnection);
    }
}
