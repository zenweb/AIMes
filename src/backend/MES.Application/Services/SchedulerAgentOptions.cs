using System.ComponentModel.DataAnnotations;

namespace MES.Application.Services;

public sealed class SchedulerAgentOptions
{
    public const string SectionName = "Agent";

    public bool EnableSchedulingEventHandler { get; init; }

    [Range(15, 3600)]
    public int SchedulingEventPollSeconds { get; init; } = 60;
}
