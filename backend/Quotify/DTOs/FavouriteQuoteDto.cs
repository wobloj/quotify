namespace Quotify.DTOs;

public class FavouriteQuoteDto
{
    public int QuoteId { get; set; }
    public DateTime LikedAt { get; set; }
    public int Id { get; set; }
    public string Text { get; set; } = null!;
    public string Author { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? ImageUrl { get; set; }
}


