namespace MES.AI.Pro.Services;

internal static class AiPromptBudget
{
    public const int MaxInputTokens = 4000;
    public const int MaxPromptChars = MaxInputTokens * 4;

    public static string Bound(string prompt)
    {
        if (prompt.Length <= MaxPromptChars)
        {
            return prompt;
        }

        const string marker = "\n\n[TRUNCATED_TO_TOKEN_BUDGET]";
        var allowed = Math.Max(0, MaxPromptChars - marker.Length);
        return string.Concat(prompt.AsSpan(0, allowed), marker);
    }
}
