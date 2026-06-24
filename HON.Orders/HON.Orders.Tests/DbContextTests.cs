namespace HON.Orders.Tests
{
  public class DbContextTests : IDisposable
  {
    private readonly AppDbContext _context;

    public DbContextTests()
    {
      var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString())
        .Options;

      _context = new AppDbContext(options);
      _context.Database.EnsureCreated();
    }

    [Fact]
    public void AppDbContext_CanSaveAndLoadCustomer()
    {
      var customer = new Customer { Name = "Alice", Email = "alice@example.com" };
      _context.Customers.Add(customer);
      _context.SaveChanges();

      var saved = _context.Customers.FirstOrDefault(c => c.Email == "alice@example.com");
      Assert.NotNull(saved);
      Assert.Equal("Alice", saved.Name);
    }

    public void Dispose()
    {
      _context.Dispose();
    }
  }
}