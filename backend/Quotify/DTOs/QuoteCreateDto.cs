namespace Quotify.DTOs
{
    public class QuoteCreateDto
    {
        public string Text { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string? ImageUrl { get; set; }
    }
}
