using System.ComponentModel.DataAnnotations;

namespace Quotify.DTOs;

public class QuoteLikeRequest
{
    [Required]
    public int QuoteId { get; set; }
}



