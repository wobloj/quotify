using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quotify.Models
{
    public class Quote
    {
        public int Id { get; set; }

        [Required]
        public string Text { get; set; } = null!;

        [Required]
        public string Author { get; set; } = null!;

        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CategoryId { get; set; }

        [Required]
        [ForeignKey("CategoryId")]
        public Category Category { get; set; } = null!;
    }
}
