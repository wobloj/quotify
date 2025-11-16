using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quotify.Data;
using Quotify.DTOs;
using Quotify.Models;

namespace Quotify.Controllers
{
    [ApiController]
    [Route("categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetCategories([FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _context.Categories.AsQueryable();

            var totalCount = await query.CountAsync();

            var categories = await query
                .OrderBy(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new
            {
                currentPage = page,
                pageSize,
                totalItems = totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                data = categories
            };

            return Ok(response);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Kategoria nie znaleziona." });

            var dto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt
            };

            return Ok(dto);
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Kategoria nie znaleziona." });

            if (dto.Name != null)
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest(new { message = "Nazwa kategorii nie może być pusta." });

                category.Name = dto.Name;
            }

            if (dto.Description != null)
            {
                category.Description = dto.Description;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name))
                return BadRequest(new { message = "Nazwa kategorii jest wymagana." });

            category.CreatedAt = DateTime.UtcNow;
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var categoryToDelete = await _context.Categories
                .Include(c => c.Quotes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (categoryToDelete == null)
                return NotFound("Nie znaleziono kategorii.");

            var fallbackCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == "Uncategorized");

            if (fallbackCategory == null)
                return BadRequest("Brak kategorii zastępczej 'Bez kategorii'. Utwórz ją najpierw.");

            // Przypisz cytaty do kategorii zastępczej
            var quotesToUpdate = await _context.Quotes
                .Where(q => q.CategoryId == id)
                .ToListAsync();

            foreach (var quote in quotesToUpdate)
            {
                quote.CategoryId = fallbackCategory.Id;
            }

            // Usuń kategorię
            _context.Categories.Remove(categoryToDelete);

            // Zapisz zmiany
            await _context.SaveChangesAsync();

            return Ok($"Kategoria '{categoryToDelete.Name}' została usunięta, a {quotesToUpdate.Count} cytatów przypisano do '{fallbackCategory.Name}'.");
        }
    }
}
