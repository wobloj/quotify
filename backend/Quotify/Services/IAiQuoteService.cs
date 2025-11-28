using System.Threading;
using System.Threading.Tasks;

namespace Quotify.Services;

public interface IAiQuoteService
{
    Task<string> GeneratePolishQuoteAsync(string? theme, CancellationToken cancellationToken = default);
}




