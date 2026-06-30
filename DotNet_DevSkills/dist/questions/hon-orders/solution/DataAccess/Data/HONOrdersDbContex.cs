using DataAccess.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Data
{
    public class HONOrdersDbContex : DbContext
    {
        public HONOrdersDbContex() { }
        public HONOrdersDbContex(DbContextOptions<HONOrdersDbContex> options) : base(options) { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Provide connection string
                optionsBuilder.UseSqlite("Provide your ConnectionString");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Customer>().HasData(
                new Customer { Id = 1, Name = "Anita", Email = "anita@test.com" },
                new Customer { Id = 2, Name = "Rahul", Email = "rahul@test.com" },
                new Customer { Id = 3, Name = "Priya", Email = "priya@test.com" },
                new Customer { Id = 4, Name = "Deepti", Email = "Deepti@test.com" },
                new Customer { Id = 5, Name = "Abhay", Email = "Abhay@test.com" },
                new Customer { Id = 6, Name = "Kanchan", Email = "Kanchan@test.com" }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Laptop", Sku = "L100", Category = "Electronics", UnitPrice = 50000, StockQuantity = 10 },
                new Product { Id = 2, Name = "Mouse", Sku = "M200", Category = "Electronics", UnitPrice = 500, StockQuantity = 100 },
                new Product { Id = 3, Name = "Keyboard", Sku = "K300", Category = "Electronics", UnitPrice = 1500, StockQuantity = 50 },
                new Product { Id = 4, Name = "Monitor", Sku = "MO400", Category = "Electronics", UnitPrice = 10000, StockQuantity = 20 },
                new Product { Id = 5, Name = "Chair", Sku = "C500", Category = "Furniture", UnitPrice = 2000, StockQuantity = 30 }
            );
        }

        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Product> Products { get; set; }
    }
}
