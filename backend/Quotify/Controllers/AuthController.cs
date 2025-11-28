using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quotify.DTOs;
using Quotify.Services;
using Quotify.Data;
using Quotify.Models;

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

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var user = new User
            {
                Email = req.Email,
                PasswordHash = _authService.HashPassword(req.Password),
                Role = "User"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = _authService.GenerateJwtToken(user);

            return Ok(new RegisterResponse
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }
    }
}
