using MES.Domain.Primitives;

namespace MES.Domain.ValueObjects;

public sealed class ExternalReference : ValueObject
{
    public string System { get; private set; } = string.Empty;
    public string ReferenceId { get; private set; } = string.Empty;
    public string ReferenceType { get; private set; } = string.Empty;

    private ExternalReference() { }

    public ExternalReference(string system, string referenceId, string referenceType = "")
    {
        System = system;
        ReferenceId = referenceId;
        ReferenceType = referenceType;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return System;
        yield return ReferenceId;
        yield return ReferenceType;
    }
}
