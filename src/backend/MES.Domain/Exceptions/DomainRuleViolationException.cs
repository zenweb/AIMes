namespace MES.Domain.Exceptions;

public class DomainRuleViolationException : InvalidOperationException
{
    public DomainRuleViolationException(string message) : base(message)
    {
    }
}
