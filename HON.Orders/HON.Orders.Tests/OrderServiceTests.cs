using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using HON.Orders.Domain.Services;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Tests
{
    /// <summary>
    /// Unit tests for OrderService
    /// TODO: Implement all test methods
    /// </summary>
    public class OrderServiceTests
    {
        private AppDbContext CreateInMemoryContext()
        {
            // TODO: Create in-memory database context
            // var options = new DbContextOptionsBuilder<AppDbContext>()
            //     .UseInMemoryDatabase(Guid.NewGuid().ToString())
            //     .Options;
            // return new AppDbContext(options);
            
            throw new NotImplementedException("TODO: Implement in-memory context creation");
        }

        private void SeedTestData(AppDbContext context)
        {
            // TODO: Seed test data
            // - Create customers
            // - Create products
            // - Create orders with items
        }

        [Fact]
        public void GetTopCustomersByRevenue_ReturnsTopFiveCustomers()
        {
            // TODO: Arrange
            // var context = CreateInMemoryContext();
            // SeedTestData(context);
            // var service = new OrderService(context);

            // TODO: Act
            // var result = service.GetTopCustomersByRevenue(30, 5).ToList();

            // TODO: Assert
            // Assert.True(result.Count > 0);
        }

        [Fact]
        public async Task StreamOrdersAsync_YieldsResultsInPages()
        {
            // TODO: Arrange
            // var context = CreateInMemoryContext();
            // SeedTestData(context);
            // var service = new OrderService(context);
            // var since = DateTime.UtcNow.AddDays(-60);
            // var orders = new List<Order>();

            // TODO: Act
            // await foreach (var order in service.StreamOrdersAsync(since, pageSize: 2))
            // {
            //     orders.Add(order);
            // }

            // TODO: Assert
            // Assert.True(orders.Count > 0);
        }
    }
}
