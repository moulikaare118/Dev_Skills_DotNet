using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Tests
{
    /// <summary>
    /// Integration tests for AppDbContext
    /// TODO: Implement all test methods
    /// </summary>
    public class DbContextTests
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

        [Fact]
        public void SaveCustomer_Success()
        {
            // TODO: Arrange
            // var context = CreateInMemoryContext();
            // var customer = new Customer { Name = "Test", Email = "test@example.com" };

            // TODO: Act
            // context.Customers.Add(customer);
            // context.SaveChanges();

            // TODO: Assert
            // Assert.True(customer.Id > 0);
        }

        [Fact]
        public void SoftDelete_ExcludesDeletedRecords()
        {
            // TODO: Arrange
            // var context = CreateInMemoryContext();
            // var customer = new Customer { Name = "Test", Email = "test@example.com" };
            // context.Customers.Add(customer);
            // context.SaveChanges();

            // TODO: Act
            // customer.IsDeleted = true;
            // context.SaveChanges();
            // var result = context.Customers.FirstOrDefault(c => c.Id == customer.Id);

            // TODO: Assert
            // Assert.Null(result);
        }

        [Fact]
        public void IncludeDeleted_ShowsDeletedRecords()
        {
            // TODO: Arrange
            // var context = CreateInMemoryContext();
            // var customer = new Customer { Name = "Test", Email = "test@example.com", IsDeleted = true };
            // context.Customers.Add(customer);
            // context.SaveChanges();

            // TODO: Act
            // var result = context.IncludeDeleted<Customer>().FirstOrDefault(c => c.Id == customer.Id);

            // TODO: Assert
            // Assert.NotNull(result);
            // Assert.True(result.IsDeleted);
        }
    }
}
