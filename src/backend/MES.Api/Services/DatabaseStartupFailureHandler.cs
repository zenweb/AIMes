namespace MES.Api.Services;

public static class DatabaseStartupFailureHandler
{
    public static bool Handle(Exception exception, IHostEnvironment environment, ILogger logger)
    {
        if (environment.IsDevelopment())
        {
            logger.LogWarning(exception, "数据库不可用，API 将以无持久化模式运行");
            return false;
        }

        logger.LogCritical(exception, "数据库不可用，无法启动");
        Environment.ExitCode = 1;
        return true;
    }
}
