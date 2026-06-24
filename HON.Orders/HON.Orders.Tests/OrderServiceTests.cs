namespace HON.Orders.Tests
{
  public class OrderServiceTests : IDisposable
  {
    private readonly AppDbContext _context;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
      var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

      _context = new AppDbContext(options);
      _service = new OrderService(_context);

      SeedTestData();
    }

    [Fact]
    public void GetTopCustomersByRevenue_ReturnsTopFiveCustomers()
    {
      var result = _service.GetTopCustomersByRevenue(30, 5).ToList();
      Assert.Equal(2, result.Count);
      Assert.Equal("Alice", result[0].CustomerName);
      Assert.True(result[0].Revenue > 0);
    }

    [Fact]
    public async Task StreamOrdersAsync_YieldsResultsInPages()
    {
      var since = DateTime.UtcNow.AddDays(-60);
      var orders = new List<Order>();

      await foreach (var order in _service.StreamOrdersAsync(since, pageSize: 2))
      {
        orders.Add(order);
      }

      Assert.True(orders.Count > 0);
    }

    private void SeedTestData()
    {
      var customer = new Customer { Name = "Alice", Email = "alice@example.com" };
      var product = new Product { Name = "Widget", Sku = "WID001", UnitPrice = 99.99m };

      _context.Customers.Add(customer);
      _context.Products.Add(product);
      _context.SaveChanges();
    }

    public void Dispose()
    {
      _context.Dispose();
    }
  }
}