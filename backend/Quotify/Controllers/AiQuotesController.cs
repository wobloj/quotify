using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quotify.DTOs;
using Quotify.Services;

namespace Quotify.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiQuotesController : ControllerBase
{
    private readonly IAiQuoteService _aiQuoteService;

    public AiQuotesController(IAiQuoteService aiQuoteService)
    {
        _aiQuoteService = aiQuoteService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<GenerateAiQuoteResponse>> GenerateQuote([FromBody] GenerateAiQuoteRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var quote = await _aiQuoteService.GeneratePolishQuoteAsync(request.Theme, cancellationToken);
            return Ok(new GenerateAiQuoteResponse { Quote = quote });
        }
        catch (AiQuoteServiceException ex)
        {
            var problem = new ProblemDetails
            {
                Status = (int)ex.StatusCode,
                Title = ex.StatusCode == HttpStatusCode.TooManyRequests
                    ? "Limit zapytań do AI został chwilowo przekroczony."
                    : "Zewnętrzny serwis AI jest niedostępny.",
                Detail = ex.Message
            };

            return StatusCode(problem.Status ?? StatusCodes.Status502BadGateway, problem);
        }
    }
}

