using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quotify.Models;

public class SuggestedQuote
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Text { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Author { get; set; } = null!;

    public int? CategoryId { get; set; }

    [Required]
    public int UserId { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}



