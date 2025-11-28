using System;
using System.Net;

namespace Quotify.Services;

public sealed class AiQuoteServiceException : Exception
{
    public HttpStatusCode StatusCode { get; }

    public AiQuoteServiceException(HttpStatusCode statusCode, string message, Exception? innerException = null)
        : base(message, innerException)
    {
        StatusCode = statusCode;
    }
}




