using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Quotify.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Quote>? Quotes { get; set; }
    }
}
