using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Quotify.Services;

public sealed class AiQuoteService : IAiQuoteService
{
    private const int MaxRetries = 2;
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
    private static readonly SemaphoreSlim RequestLock = new(1, 1);
    private static DateTimeOffset _lastRequestAt = DateTimeOffset.MinValue;

    private readonly HttpClient _httpClient;
    private readonly ILogger<AiQuoteService> _logger;
    private readonly string _model;
    private readonly TimeSpan _minDelayBetweenRequests;
    private readonly Uri _chatCompletionsUri;
    private readonly string _systemPrompt = "Jesteś kreatywnym pisarzem tworzącym krótkie, oryginalne i inspirujące cytaty w języku polskim. Cytaty mają być maksymalnie dwuzdaniowe.";

    public AiQuoteService(HttpClient httpClient, IConfiguration configuration, ILogger<AiQuoteService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        var apiKey = configuration["DeepSeek:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Brakuje klucza API DeepSeek. Skonfiguruj DeepSeek:ApiKey w konfiguracji aplikacji.");
        }

        _model = configuration["DeepSeek:Model"] ?? "deepseek-chat";
        var minDelayMs = int.TryParse(configuration["DeepSeek:MinDelayMilliseconds"], out var parsedDelay)
            ? Math.Max(parsedDelay, 250)
            : 2000;
        _minDelayBetweenRequests = TimeSpan.FromMilliseconds(minDelayMs);
        _chatCompletionsUri = new Uri(configuration["DeepSeek:BaseUrl"] ?? "https://api.deepseek.com/v1/chat/completions");

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string> GeneratePolishQuoteAsync(string? theme, CancellationToken cancellationToken = default)
    {
        var prompt = string.IsNullOrWhiteSpace(theme)
            ? "Stwórz całkowicie nowy, inspirujący cytat po polsku."
            : $"Stwórz inspirujący cytat po polsku na temat: \"{theme}\".";

        var requestBody = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = _systemPrompt },
                new { role = "user", content = prompt }
            },
            max_tokens = 120,
            temperature = 0.9
        };

        for (var attempt = 0; attempt <= MaxRetries; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                await EnsureMinDelayAsync(cancellationToken);

                using var httpRequest = new HttpRequestMessage(HttpMethod.Post, _chatCompletionsUri)
                {
                    Content = JsonContent.Create(requestBody, options: SerializerOptions)
                };

                using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    var delay = GetRetryDelay(response, attempt);
                    _logger.LogWarning("DeepSeek zwrócił 429 (rate limit). Próba {Attempt}/{MaxRetries}. Odczekam {Delay} ms.", attempt + 1, MaxRetries + 1, delay.TotalMilliseconds);

                    if (attempt < MaxRetries)
                    {
                        await Task.Delay(delay, cancellationToken);
                        continue;
                    }

                    var limitMessage = ExtractErrorMessage(responseContent) ?? "Serwis AI jest chwilowo przeciążony. Spróbuj ponownie za chwilę.";
                    throw new AiQuoteServiceException(HttpStatusCode.TooManyRequests, limitMessage);
                }

                if (!response.IsSuccessStatusCode)
                {
                    var providerMessage = ExtractErrorMessage(responseContent)
                        ?? $"DeepSeek zwrócił błąd {(int)response.StatusCode}.";

                    throw new AiQuoteServiceException(response.StatusCode, providerMessage);
                }

                var payload = JsonSerializer.Deserialize<ChatCompletionResponse>(responseContent, SerializerOptions);

                var quote = payload?.Choices?.FirstOrDefault()?.Message?.Content;
                if (string.IsNullOrWhiteSpace(quote))
                {
                    throw new InvalidOperationException("Brak treści odpowiedzi modelu.");
                }

                return quote.Trim();
            }
            catch (AiQuoteServiceException)
            {
                throw;
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
            {
                _logger.LogError(ex, "Nie udało się wygenerować cytatu AI (próba {Attempt}).", attempt + 1);

                if (attempt < MaxRetries)
                {
                    await Task.Delay(TimeSpan.FromMilliseconds(500 * Math.Pow(2, attempt)), cancellationToken);
                    continue;
                }

                throw new AiQuoteServiceException(HttpStatusCode.BadGateway, "Nie udało się uzyskać cytatu AI. Spróbuj ponownie później.", ex);
            }
        }

        throw new AiQuoteServiceException(HttpStatusCode.BadGateway, "Nie udało się uzyskać cytatu AI. Spróbuj ponownie później.");
    }

    private async Task EnsureMinDelayAsync(CancellationToken cancellationToken)
    {
        await RequestLock.WaitAsync(cancellationToken);
        try
        {
            var now = DateTimeOffset.UtcNow;
            var nextAllowed = _lastRequestAt + _minDelayBetweenRequests;
            if (nextAllowed > now)
            {
                var delay = nextAllowed - now;
                _logger.LogDebug("Oczekiwanie {Delay} ms aby spełnić minimalny odstęp między zapytaniami.", delay.TotalMilliseconds);
                await Task.Delay(delay, cancellationToken);
                now = DateTimeOffset.UtcNow;
            }

            _lastRequestAt = now;
        }
        finally
        {
            RequestLock.Release();
        }
    }

    private static TimeSpan GetRetryDelay(HttpResponseMessage response, int attempt)
    {
        if (response.Headers.RetryAfter?.Delta is { } delta)
        {
            return delta;
        }

        return TimeSpan.FromMilliseconds(1000 * Math.Pow(2, attempt));
    }

    private static string? ExtractErrorMessage(string? responseContent)
    {
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            return null;
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<ErrorEnvelope>(responseContent, SerializerOptions);
            return parsed?.Error?.Message;
        }
        catch
        {
            return responseContent;
        }
    }

    private sealed record ChatCompletionResponse(
        [property: JsonPropertyName("choices")] IReadOnlyList<Choice> Choices);

    private sealed record Choice(
        [property: JsonPropertyName("message")] Message Message);

    private sealed record Message(
        [property: JsonPropertyName("content")] string Content);

    private sealed record ErrorEnvelope(
        [property: JsonPropertyName("error")] ErrorDetail? Error);

    private sealed record ErrorDetail(
        [property: JsonPropertyName("message")] string? Message);
}

