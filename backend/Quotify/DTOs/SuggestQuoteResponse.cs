namespace Quotify.DTOs;

public class SuggestQuoteResponse
{
    public int Id { get; set; }
    public string Text { get; set; } = null!;
    public string Author { get; set; } = null!;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class SuggestedQuoteAdminResponse
{
    public int Id { get; set; }
    public string Text { get; set; } = null!;
    public string Author { get; set; } = null!;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string UserEmail { get; set; } = null!;
    public int UserId { get; set; }
}


