using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quotify.DTOs;
using Quotify.Services;
using Quotify.Data;

namespace Quotify.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IAuthService _authService;

        public AuthController(AppDbContext db, IAuthService authService)
        {
            _db = db;
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null || !_authService.VerifyPassword(user.PasswordHash, req.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
            var token = _authService.GenerateJwtToken(user);
            return Ok(new LoginResponse
            {
                Token = token,
                Email = user.Email,
                Role = user.Role
            });
        }
    }
}
