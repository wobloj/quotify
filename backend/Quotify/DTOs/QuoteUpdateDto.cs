namespace Quotify.DTOs
{
    public class QuoteUpdateDto
    {
        public string? Text { get; set; }
        public string? Author { get; set; }
        public int CategoryId { get; set; }
        public string? ImageUrl { get; set; }
    }
}
