using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quotify.Data;
using Quotify.Models;
using Quotify.DTOs;

namespace Quotify.Controllers
{
    [Route("quotes")]
    [ApiController]
    public class QuotesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static int? _lastQuoteId = null;

        public QuotesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetQuotes([FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery(Name = "category_id")] int? categoryId = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            // 🔹 Budowanie zapytania
            var query = _context.Quotes
                .Include(q => q.Category)
                .AsQueryable();

            // 🔹 Filtrowanie po kategorii
            if (categoryId.HasValue)
            {
                query = query.Where(q => q.CategoryId == categoryId.Value);
            }

            // 🔹 Liczenie wszystkich rekordów (po filtrze)
            var totalCount = await query.CountAsync();

            // 🔹 Pobieranie danych z paginacją
            var quotes = await query
                .OrderBy(q => q.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(q => new QuoteDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Author = q.Author,
                    CreatedAt = q.CreatedAt,
                    CategoryId = q.CategoryId,
                    CategoryName = q.Category != null ? q.Category.Name : null
                })
                .ToListAsync();

            // 🔹 Zwrócenie danych z metadanymi paginacji
            var response = new
            {
                currentPage = page,
                pageSize,
                totalItems = totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                data = quotes
            };

            return Ok(response);
        }

        [HttpGet("random")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRandomQuote([FromQuery] int? category_id = null)
        {
            IQueryable<Quote> query = _context.Quotes.Include(q => q.Category);

            // 🔹 Filtruj po kategorii, jeśli podano
            if (category_id.HasValue)
            {
                query = query.Where(q => q.CategoryId == category_id.Value);
            }

            var count = await query.CountAsync();
            if (count == 0)
            {
                return StatusCode(204, "Brak cytatów w tej kategorii lub w bazie danych.");
            }

            // 🔹 Zapobiegaj powtórzeniu tego samego cytatu dwa razy z rzędu
            Quote? quote = null;
            int attempts = 0;
            const int maxAttempts = 5;

            do
            {
                var rand = new Random();
                int skip = rand.Next(0, count);

                quote = await query.Skip(skip).FirstOrDefaultAsync();
                attempts++;
            }
            while (quote != null && quote.Id == _lastQuoteId && attempts < maxAttempts);

            // 🔹 Aktualizuj ostatni wylosowany cytat
            if (quote != null)
            {
                _lastQuoteId = quote.Id;
            }

            // 🔹 Utwórz DTO i zwróć wynik
            var result = new
            {
                quote?.Id,
                quote?.Text,
                quote?.Author,
                quote?.CategoryId,
                CategoryName = quote?.Category != null ? quote.Category.Name : null
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<QuoteDto>> GetQuote(int id)
        {
            var quote = await _context.Quotes
                .Include(q => q.Category)
                .Where(q => q.Id == id)
                .Select(q => new QuoteDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Author = q.Author,
                    CreatedAt = q.CreatedAt,
                    CategoryId = q.CategoryId,
                    CategoryName = q.Category != null ? q.Category.Name : null
                })
                .FirstOrDefaultAsync();

            if (quote == null)
                return NotFound();

            return Ok(quote);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateQuote([FromBody] QuoteCreateDto dto)
        {
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                return BadRequest("Nie znaleziono kategorii");

            var quote = new Quote
            {
                Text = dto.Text,
                Author = dto.Author,
                CategoryId = dto.CategoryId
            };

            _context.Quotes.Add(quote);
            await _context.SaveChangesAsync();

            var result = new QuoteDto
            {
                Id = quote.Id,
                Text = quote.Text,
                Author = quote.Author,
                CategoryId = quote.CategoryId,
                CategoryName = category.Name
            };

            return Ok(result);
        }

        [HttpPatch("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateQuote(int id, QuoteUpdateDto dto)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
                return NotFound();

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                return BadRequest(new { message = "Nie znaleziono kategorii o podanym ID." });

            if (dto.Text != null)
                quote.Text = dto.Text;
            if (dto.Author != null)
                quote.Author = dto.Author;

            quote.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteQuote(int id)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
                return NotFound();

            _context.Quotes.Remove(quote);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}