using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Quotify.Data;
using Quotify.DTOs;
using Quotify.Models;

namespace Quotify.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuggestedQuotesController : ControllerBase
{
    private readonly AppDbContext _db;

    public SuggestedQuotesController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpPost]
    public async Task<IActionResult> SuggestQuote([FromBody] SuggestQuoteRequest request)
    {
        var userId = GetUserId();

        // Jeśli podano CategoryId, sprawdź czy kategoria istnieje
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _db.Categories.AnyAsync(c => c.Id == request.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category not found." });
            }
        }

        var suggestedQuote = new SuggestedQuote
        {
            Text = request.Text,
            Author = request.Author,
            CategoryId = request.CategoryId,
            UserId = userId,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _db.SuggestedQuotes.Add(suggestedQuote);
        await _db.SaveChangesAsync();

        // Pobierz nazwę kategorii jeśli istnieje
        string? categoryName = null;
        if (suggestedQuote.CategoryId.HasValue)
        {
            var category = await _db.Categories.FindAsync(suggestedQuote.CategoryId.Value);
            categoryName = category?.Name;
        }

        var response = new SuggestQuoteResponse
        {
            Id = suggestedQuote.Id,
            Text = suggestedQuote.Text,
            Author = suggestedQuote.Author,
            CategoryId = suggestedQuote.CategoryId,
            CategoryName = categoryName,
            Status = suggestedQuote.Status,
            CreatedAt = suggestedQuote.CreatedAt
        };

        return Ok(response);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserSuggestions()
    {
        var userId = GetUserId();

        var suggestions = await _db.SuggestedQuotes
            .Include(sq => sq.Category)
            .Where(sq => sq.UserId == userId)
            .Select(sq => new SuggestQuoteResponse
            {
                Id = sq.Id,
                Text = sq.Text,
                Author = sq.Author,
                CategoryId = sq.CategoryId,
                CategoryName = sq.Category != null ? sq.Category.Name : null,
                Status = sq.Status,
                CreatedAt = sq.CreatedAt
            })
            .ToListAsync();

        return Ok(suggestions);
    }

    [HttpGet("user/random")]
    public async Task<IActionResult> GetRandomUserSuggestion([FromQuery] int? category_id = null)
    {
        var userId = GetUserId();

        var query = _db.SuggestedQuotes
            .Include(sq => sq.Category)
            .Where(sq => sq.UserId == userId);

        if (category_id.HasValue && category_id.Value > 0)
        {
            query = query.Where(sq => sq.CategoryId == category_id.Value);
        }

        var suggestions = await query.ToListAsync();

        if (!suggestions.Any())
        {
            return NoContent();
        }

        var random = new Random();
        var randomSuggestion = suggestions[random.Next(suggestions.Count)];

        var response = new SuggestQuoteResponse
        {
            Id = randomSuggestion.Id,
            Text = randomSuggestion.Text,
            Author = randomSuggestion.Author,
            CategoryId = randomSuggestion.CategoryId,
            CategoryName = randomSuggestion.Category?.Name,
            Status = randomSuggestion.Status,
            CreatedAt = randomSuggestion.CreatedAt
        };

        return Ok(response);
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllSuggestions()
    {
        var suggestions = await _db.SuggestedQuotes
            .Include(sq => sq.Category)
            .Include(sq => sq.User)
            .Select(sq => new SuggestedQuoteAdminResponse
            {
                Id = sq.Id,
                Text = sq.Text,
                Author = sq.Author,
                CategoryId = sq.CategoryId,
                CategoryName = sq.Category != null ? sq.Category.Name : null,
                Status = sq.Status,
                CreatedAt = sq.CreatedAt,
                UserEmail = sq.User.Email,
                UserId = sq.UserId
            })
            .OrderByDescending(sq => sq.CreatedAt)
            .ToListAsync();

        return Ok(suggestions);
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ApproveSuggestion(int id)
    {
        var suggestion = await _db.SuggestedQuotes
            .Include(sq => sq.Category)
            .FirstOrDefaultAsync(sq => sq.Id == id);

        if (suggestion == null)
        {
            return NotFound(new { message = "Suggestion not found." });
        }

        // Sprawdź czy kategoria istnieje (jeśli została podana)
        if (suggestion.CategoryId.HasValue)
        {
            var categoryExists = await _db.Categories.AnyAsync(c => c.Id == suggestion.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category not found." });
            }
        }
        else
        {
            // Jeśli nie ma kategorii, możesz zwrócić błąd lub użyć domyślnej
            return BadRequest(new { message = "Suggestion must have a category to be approved." });
        }

        // Utwórz nowy cytat z propozycji
        var quote = new Quote
        {
            Text = suggestion.Text,
            Author = suggestion.Author,
            CategoryId = suggestion.CategoryId!.Value,
            CreatedAt = DateTime.UtcNow
        };

        _db.Quotes.Add(quote);

        // Zaktualizuj status propozycji
        suggestion.Status = "Approved";

        await _db.SaveChangesAsync();

        return Ok(new { message = "Suggestion approved and quote created.", quoteId = quote.Id });
    }

    [HttpPatch("{id}/reject")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RejectSuggestion(int id)
    {
        var suggestion = await _db.SuggestedQuotes.FindAsync(id);

        if (suggestion == null)
        {
            return NotFound(new { message = "Suggestion not found." });
        }

        // Zmień status na "Rejected" zamiast usuwać
        suggestion.Status = "Rejected";
        await _db.SaveChangesAsync();

        return Ok(new { message = "Suggestion rejected." });
    }
}
