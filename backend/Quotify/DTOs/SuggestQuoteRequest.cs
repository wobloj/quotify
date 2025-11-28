using System.ComponentModel.DataAnnotations;

namespace Quotify.DTOs;

public class SuggestQuoteRequest
{
    [Required]
    [MaxLength(1000)]
    public string Text { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = null!;

    public int? CategoryId { get; set; }
}



