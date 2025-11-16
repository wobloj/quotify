using System.ComponentModel.DataAnnotations;

namespace Quotify.DTOs
{
    public class UpdateCategoryDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}