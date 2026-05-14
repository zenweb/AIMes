namespace MES.Application.DTOs;

/// <summary>分页结果</summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

/// <summary>分页查询参数</summary>
public record PageQueryParameters(int Page = 1, int PageSize = 20);
