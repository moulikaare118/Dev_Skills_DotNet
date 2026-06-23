using HON.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HON.Orders.Data
{
    /// <summary>
    /// Application database context
    /// TODO: Configure all entities with Fluent API
    /// TODO: Configure relationships, indices, shadows, concurrency tokens
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TODO: Configure entities using Fluent API
            // 
            // Configuration needed for each entity:
            // - Relationships (One-to-Many)
            // - Unique constraints (Email, OrderNumber, Sku)
            // - Decimal precision (18,2)
            // - String lengths
            // - Concurrency tokens (RowVersion)
            // - Shadow properties (CreatedAt, LastModifiedAt)
            // - Soft delete query filters (IsDeleted = false)
            // 
            // Example pattern:
            // modelBuilder.Entity<Customer>()
            //     .HasMany(c => c.Orders)
            //     .WithOne(o => o.Customer)
            //     .HasForeignKey(o => o.CustomerId);

            SeedData(modelBuilder);
        }

        /// <summary>
        /// Seeds initial test data
        /// TODO: Add seed data for testing
        /// </summary>
        private static void SeedData(ModelBuilder modelBuilder)
        {
            // TODO: Seed at least 3 customers, 5 products, 3 orders with items
            // Example:
            // var customer1 = new Customer { Id = 1, Name = "Alice", Email = "alice@example.com" };
            // modelBuilder.Entity<Customer>().HasData(customer1);
        }

        /// <summary>
        /// Gets a queryable including soft-deleted records
        /// TODO: Used by admin to view deleted records
        /// </summary>
        public IQueryable<T> IncludeDeleted<T>() where T : class, IHasSoftDelete
        {
            return Set<T>().IgnoreQueryFilters();
        }
    }
}
