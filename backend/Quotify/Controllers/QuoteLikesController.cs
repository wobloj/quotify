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
public class QuoteLikesController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuoteLikesController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpPost]
    public async Task<IActionResult> LikeQuote([FromBody] QuoteLikeRequest request)
    {
        var userId = GetUserId();

        // Sprawdź czy cytat istnieje
        var quoteExists = await _db.Quotes.AnyAsync(q => q.Id == request.QuoteId);
        if (!quoteExists)
        {
            return NotFound(new { message = "Quote not found." });
        }

        // Sprawdź czy użytkownik już polubił ten cytat
        var existingLike = await _db.QuoteLikes
            .FirstOrDefaultAsync(ql => ql.UserId == userId && ql.QuoteId == request.QuoteId);

        if (existingLike != null)
        {
            return BadRequest(new { message = "Quote already liked by this user." });
        }

        var like = new QuoteLike
        {
            UserId = userId,
            QuoteId = request.QuoteId,
            LikedAt = DateTime.UtcNow
        };

        _db.QuoteLikes.Add(like);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Quote liked successfully.", likeId = like.Id });
    }

    [HttpDelete("{quoteId}")]
    public async Task<IActionResult> UnlikeQuote(int quoteId)
    {
        var userId = GetUserId();

        var like = await _db.QuoteLikes
            .FirstOrDefaultAsync(ql => ql.UserId == userId && ql.QuoteId == quoteId);

        if (like == null)
        {
            return NotFound(new { message = "Like not found." });
        }

        _db.QuoteLikes.Remove(like);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Quote unliked successfully." });
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserLikes()
    {
        var userId = GetUserId();

        var likes = await _db.QuoteLikes
            .Include(ql => ql.Quote)
                .ThenInclude(q => q.Category)
            .Where(ql => ql.UserId == userId)
            .Select(ql => new FavouriteQuoteDto
            {
                QuoteId = ql.QuoteId,
                LikedAt = ql.LikedAt,
                Id = ql.Quote.Id,
                Text = ql.Quote.Text,
                Author = ql.Quote.Author,
                CreatedAt = ql.Quote.CreatedAt,
                CategoryId = ql.Quote.CategoryId,
                CategoryName = ql.Quote.Category != null ? ql.Quote.Category.Name : null,
                ImageUrl = ql.Quote.ImageUrl
            })
            .OrderByDescending(fq => fq.LikedAt)
            .ToListAsync();

        return Ok(likes);
    }

    [HttpGet("user/{quoteId}")]
    public async Task<IActionResult> IsQuoteLikedByUser(int quoteId)
    {
        var userId = GetUserId();
        var isLiked = await _db.QuoteLikes
            .AnyAsync(ql => ql.UserId == userId && ql.QuoteId == quoteId);
        return Ok(new { isLiked });
    }
}


