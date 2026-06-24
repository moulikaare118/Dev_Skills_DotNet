namespace HON.Orders.Domain.Services
{
  // TODO: Implement revenue analysis, async order streaming, and dynamic EF filter
  // composition for the HON Orders assessment requirements.
  public class OrderService
  {
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
      _context = context;
    }

    public IEnumerable<TopCustomerDto> GetTopCustomersByRevenue(int days = 30, int topCount = 5)
    {
      var since = DateTime.UtcNow.AddDays(-days);

      return _context.Orders
        .Where(o => o.OrderDate >= since)
        .Include(o => o.OrderItems)
        .GroupBy(o => o.Customer)
        .Select(g => new TopCustomerDto
        {
          CustomerName = g.Key.Name,
          OrdersCount = g.Count(),
          Revenue = g.SelectMany(o => o.OrderItems)
            .Sum(oi => oi.LineTotal)
        })
        .OrderByDescending(x => x.Revenue)
        .Take(topCount)
        .ToList();
    }

    public async IAsyncEnumerable<Order> StreamOrdersAsync(
      DateTime since,
      int pageSize = 20,
      [EnumeratorCancellation] CancellationToken ct = default)
    {
      int skip = 0;

      while (true)
      {
        var orders = await _context.Orders
          .Where(o => o.OrderDate >= since)
          .OrderByDescending(o => o.OrderDate)
          .Include(o => o.Customer)
          .Include(o => o.OrderItems)
          .Skip(skip)
          .Take(pageSize)
          .ToListAsync(ct);

        if (!orders.Any())
          break;

        foreach (var order in orders)
          yield return order;

        skip += pageSize;
      }
    }
  }

  public class TopCustomerDto
  {
    public string CustomerName { get; set; }
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
  }
}