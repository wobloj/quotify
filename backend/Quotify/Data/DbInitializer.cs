using System;
using System.Linq;
using Quotify.Models;
using Quotify.Services;

namespace Quotify.Data
{
    public class DbInitializer
    {
        private readonly AppDbContext _db;
        private readonly IAuthService _auth;

        public DbInitializer(AppDbContext db, IAuthService auth)
        {
            _db = db;
            _auth = auth;
        }

        public async Task SeedAsync()
        {
            // Seed admin user (jeśli brak)
            if (!_db.Users.Any())
            {
                var admin = new User
                {
                    Email = "admin@quotify.local",
                    PasswordHash = _auth.HashPassword("Admin123!"),
                    Role = "Admin" // dopasowane do autoryzacji w kontrolerach
                };
                _db.Users.Add(admin);
            }

            // Seed kategorii (jeśli brak)
            if (!_db.Categories.Any())
            {
                var lit = new Category { Name = "Literatura", Description = null };
                var mot = new Category { Name = "Motywacja", Description = null };
                _db.Categories.AddRange(lit, mot);

                // zapisz wcześniej żeby uzyskać Id kategorii
                await _db.SaveChangesAsync();
            }

            // Pobierz Id kategorii jeśli istnieją
            var literaturaId = _db.Categories.FirstOrDefault(c => c.Name == "Literatura")?.Id;
            var motywacjaId = _db.Categories.FirstOrDefault(c => c.Name == "Motywacja")?.Id;

            // Seed cytatów (jeśli brak)
            if (!_db.Quotes.Any())
            {
                _db.Quotes.AddRange(
                    new Quote
                    {
                        Text = "Być albo nie być.",
                        Author = "Shakespeare",
                        CategoryId = literaturaId ?? throw new InvalidOperationException("Kategoria 'Literatura' nie istnieje podczas seeda.")
                    },
                    new Quote
                    {
                        Text = "Życie to podróż.",
                        Author = "Anonim",
                        CategoryId = motywacjaId ?? throw new InvalidOperationException("Kategoria 'Motywacja' nie istnieje podczas seeda.")
                    }
                );
            }

            await _db.SaveChangesAsync();
        }
    }
}
