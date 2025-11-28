using Microsoft.EntityFrameworkCore;
using Quotify.Models;

namespace Quotify.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<QuoteLike> QuoteLikes { get; set; }
        public DbSet<SuggestedQuote> SuggestedQuotes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Quote>()
                .HasOne(q => q.Category)
                .WithMany(c => c.Quotes)
                .HasForeignKey(q => q.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuoteLike>()
                .HasIndex(ql => new { ql.UserId, ql.QuoteId })
                .IsUnique();

            modelBuilder.Entity<SuggestedQuote>()
                .HasOne(sq => sq.User)
                .WithMany()
                .HasForeignKey(sq => sq.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SuggestedQuote>()
                .HasOne(sq => sq.Category)
                .WithMany()
                .HasForeignKey(sq => sq.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
