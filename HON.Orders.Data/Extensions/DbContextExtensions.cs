using HON.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Data.Extensions;

public static class DbContextExtensions
{
    public static async Task SeedAsync(this HonOrdersDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Customers.AnyAsync(cancellationToken))
        {
            return;
        }

        var customers = new[]
        {
            new Customer { Name = "Alice Smith", Email = "alice@example.com" },
            new Customer { Name = "Bob Lee", Email = "bob@example.com" },
            new Customer { Name = "Carol Jones", Email = "carol@example.com" }
        };

        var products = new[]
        {
            new Product { Name = "HON Notebook", Sku = "HON-001", UnitPrice = 29.99m, Category = "Office", StockQuantity = 100 },
            new Product { Name = "HON Pen", Sku = "HON-002", UnitPrice = 4.99m, Category = "Office", StockQuantity = 250 },
            new Product { Name = "HON Mug", Sku = "HON-003", UnitPrice = 12.50m, Category = "Merch", StockQuantity = 80 }
        };

        await context.Customers.AddRangeAsync(customers, cancellationToken);
        await context.Products.AddRangeAsync(products, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
