using HON.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;

namespace HON.Orders.Data.Services;

public class OrderQueryService
{
    private readonly HonOrdersDbContext _context;

    public OrderQueryService(HonOrdersDbContext context)
    {
        _context = context;
    }

    public async Task<List<TopCustomerDto>> GetTopCustomersByRevenueAsync(DateTime since, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Where(o => o.OrderDate >= since)
            .SelectMany(o => o.OrderItems, (o, oi) => new { o.Customer, oi })
            .Where(x => x.Customer != null)
            .GroupBy(x => x.Customer!.Name)
            .Select(g => new TopCustomerDto
            {
                CustomerName = g.Key,
                OrdersCount = g.Select(x => x.oi.OrderId).Distinct().Count(),
                Revenue = g.Sum(x => x.oi.LineTotal)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(5)
            .ToListAsync(cancellationToken);
    }

    public async IAsyncEnumerable<Order> StreamOrdersAsync(DateTime since, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Where(x => x.OrderDate >= since)
            .OrderBy(x => x.OrderDate)
            .AsAsyncEnumerable();

        await foreach (var order in query.WithCancellation(cancellationToken))
        {
            yield return order;
        }
    }
}

public sealed class TopCustomerDto
{
    public string CustomerName { get; set; } = null!;
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
}
