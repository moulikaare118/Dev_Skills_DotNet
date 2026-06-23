# HON Orders Assessment — Solution Template & Expected Structure

## Solution File Structure (Expected)

```
HON.Orders/
├── HON.Orders.sln
├── ASSESSMENT_SPECIFICATION.md
├── QUICK_START_GUIDE.md
├── GRADING_GUIDE.md
├── README.md
│
├── HON.Orders.Domain/
│   ├── HON.Orders.Domain.csproj
│   ├── Entities/
│   │   ├── Customer.cs
│   │   ├── Product.cs
│   │   ├── Order.cs
│   │   ├── OrderItem.cs
│   │   ├── Payment.cs
│   │   └── AuditLog.cs
│   ├── ValueObjects/
│   │   └── Money.cs
│   ├── DTOs/
│   │   ├── TopCustomerDto.cs
│   │   └── ProductViewModel.cs
│   ├── Filters/
│   │   └── OrderFilterBuilder.cs
│   ├── Services/
│   │   └── OrderService.cs
│   └── Enums/
│       ├── OrderStatus.cs
│       └── PaymentMethod.cs
│
├── HON.Orders.Data/
│   ├── HON.Orders.Data.csproj
│   ├── AppDbContext.cs
│   ├── IHasSoftDelete.cs
│   ├── Migrations/
│   │   ├── 20260101000000_InitialCreate.cs
│   │   ├── 20260101000000_InitialCreate.Designer.cs
│   │   └── AppDbContextModelSnapshot.cs
│   └── Seeds/
│       └── SeedData.cs
│
├── HON.Orders.Web/
│   ├── HON.Orders.Web.csproj
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Views/
│   │   ├── Shared/
│   │   │   ├── _Layout.cshtml
│   │   │   ├── _ValidationSummary.cshtml
│   │   │   └── _SummaryCard.cshtml
│   │   ├── Shared/Components/
│   │   │   └── OrderSummary/
│   │   │       └── Default.cshtml
│   │   ├── Home/
│   │   │   └── Index.cshtml
│   │   ├── Catalog/
│   │   │   ├── Index.cshtml
│   │   │   └── Details.cshtml
│   │   └── Order/
│   │       ├── Index.cshtml
│   │       └── Create.cshtml
│   ├── Controllers/
│   │   ├── HomeController.cs
│   │   ├── CatalogController.cs
│   │   └── OrderController.cs
│   ├── Areas/
│   │   └── Admin/
│   │       ├── Controllers/
│   │       │   └── ProductController.cs
│   │       ├── Views/
│   │       │   ├── Shared/
│   │       │   │   └── _AdminLayout.cshtml
│   │       │   └── Product/
│   │       │       ├── Index.cshtml
│   │       │       ├── Create.cshtml
│   │       │       ├── Edit.cshtml
│   │       │       └── Delete.cshtml
│   │       └── _ViewImports.cshtml
│   ├── Filters/
│   │   ├── ExecutionTimeFilterAttribute.cs
│   │   └── AdminRoleCheckAttribute.cs
│   ├── TagHelpers/
│   │   └── CurrencyFormatterTagHelper.cs
│   ├── Models/
│   │   └── OrderViewModel.cs
│   └── wwwroot/
│       ├── css/
│       │   └── site.css
│       └── js/
│           └── site.js
│
├── HON.Orders.Tests/
│   ├── HON.Orders.Tests.csproj
│   ├── MoneyTests.cs
│   ├── OrderServiceTests.cs
│   ├── ProductServiceTests.cs
│   ├── DbContextTests.cs
│   └── Fixtures/
│       └── DbContextFixture.cs
│
└── .gitignore
```

---

## Core Entity Implementations

### Customer Entity

```csharp
namespace HON.Orders.Domain.Entities
{
    public class Customer : IHasSoftDelete
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Shadow properties (managed by EF Core)
        // DateTime CreatedAt
        // DateTime LastModifiedAt

        // Navigation properties
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
```

### Product Entity

```csharp
namespace HON.Orders.Domain.Entities
{
    public class Product : IHasSoftDelete
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Sku { get; set; }
        public decimal UnitPrice { get; set; }
        public string Category { get; set; }
        public int StockQuantity { get; set; }
        public byte[] RowVersion { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Shadow properties
        // DateTime CreatedAt
        // DateTime LastModifiedAt

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
```

### Order Entity

```csharp
namespace HON.Orders.Domain.Entities
{
    public class Order : IHasSoftDelete
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public int CustomerId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal Total { get; set; }
        public byte[] RowVersion { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Shadow properties
        // DateTime CreatedAt
        // DateTime LastModifiedAt

        // Navigation properties
        public Customer Customer { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Shipped,
        Delivered,
        Cancelled
    }
}
```

### OrderItem Entity

```csharp
namespace HON.Orders.Domain.Entities
{
    public class OrderItem : IHasSoftDelete
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal => Quantity * UnitPrice;
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public Order Order { get; set; }
        public Product Product { get; set; }
    }
}
```

### Payment Entity

```csharp
namespace HON.Orders.Domain.Entities
{
    public class Payment : IHasSoftDelete
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public DateTime? PaidAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public Order Order { get; set; }
    }

    public enum PaymentMethod
    {
        CreditCard,
        Debit,
        Check,
        Bank,
        Other
    }
}
```

### AuditLog Entity

```csharp
namespace HON.Orders.Domain.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityName { get; set; }
        public int EntityId { get; set; }
        public string Action { get; set; }
        public string Username { get; set; }
        public DateTime OccurredAt { get; set; }
        public string Details { get; set; }
    }
}
```

---

## Key Implementation Patterns

### Money Value Object

```csharp
namespace HON.Orders.Domain.ValueObjects
{
    public class Money : IEquatable<Money>
    {
        public decimal Amount { get; }
        public string Currency { get; }

        public Money(decimal amount, string currency = "USD")
        {
            if (amount < 0)
                throw new ArgumentException("Amount cannot be negative", nameof(amount));
            Amount = amount;
            Currency = currency;
        }

        public override string ToString() => $"{Currency} {Amount:F2}";

        public static Money operator +(Money left, Money right)
        {
            if (left.Currency != right.Currency)
                throw new InvalidOperationException("Cannot add money with different currencies");
            return new Money(left.Amount + right.Amount, left.Currency);
        }

        public static Money operator -(Money left, Money right)
        {
            if (left.Currency != right.Currency)
                throw new InvalidOperationException("Cannot subtract money with different currencies");
            return new Money(left.Amount - right.Amount, left.Currency);
        }

        public static Money operator *(Money money, decimal multiplier)
            => new Money(money.Amount * multiplier, money.Currency);

        public bool Equals(Money other)
            => other != null && Amount == other.Amount && Currency == other.Currency;

        public override bool Equals(object obj)
            => Equals(obj as Money);

        public override int GetHashCode()
            => HashCode.Combine(Amount, Currency);
    }

    public static class DecimalExtensions
    {
        public static string FormatMoney(this decimal amount, string currency = "USD")
            => new Money(amount, currency).ToString();
    }
}
```

### DbContext Configuration

```csharp
namespace HON.Orders.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Customer
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Configure Product
            modelBuilder.Entity<Product>()
                .Property(p => p.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Product>()
                .Property(p => p.RowVersion)
                .IsRowVersion();

            // Configure Order
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderNumber)
                .IsUnique();

            modelBuilder.Entity<Order>()
                .Property(o => o.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.RowVersion)
                .IsRowVersion();

            // Configure relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithMany(o => o.Payments)
                .HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure soft delete query filters
            modelBuilder.Entity<Customer>()
                .HasQueryFilter(c => !c.IsDeleted);

            modelBuilder.Entity<Product>()
                .HasQueryFilter(p => !p.IsDeleted);

            modelBuilder.Entity<Order>()
                .HasQueryFilter(o => !o.IsDeleted);

            modelBuilder.Entity<OrderItem>()
                .HasQueryFilter(oi => !oi.IsDeleted);

            modelBuilder.Entity<Payment>()
                .HasQueryFilter(p => !p.IsDeleted);

            // Configure shadow properties
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                modelBuilder.Entity(entity.ClrType)
                    .Property<DateTime>("CreatedAt")
                    .HasDefaultValueSql("GETUTCDATE()");

                modelBuilder.Entity(entity.ClrType)
                    .Property<DateTime>("LastModifiedAt")
                    .HasDefaultValueSql("GETUTCDATE()");
            }
        }
    }

    public interface IHasSoftDelete
    {
        bool IsDeleted { get; set; }
    }
}
```

### OrderService Implementation

```csharp
namespace HON.Orders.Domain.Services
{
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
```

### OrderFilterBuilder (Expression Trees)

```csharp
namespace HON.Orders.Domain.Filters
{
    public class OrderFilterBuilder
    {
        public Expression<Func<Order, bool>> BuildFilter(
            string status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            decimal? minTotal = null,
            string customerEmail = null)
        {
            var parameter = Expression.Parameter(typeof(Order), "o");
            var expressions = new List<Expression>();

            // Status filter
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
                {
                    var statusProperty = Expression.Property(parameter, nameof(Order.Status));
                    var statusConstant = Expression.Constant(orderStatus);
                    expressions.Add(Expression.Equal(statusProperty, statusConstant));
                }
            }

            // Date range filter
            if (fromDate.HasValue)
            {
                var dateProperty = Expression.Property(parameter, nameof(Order.OrderDate));
                var dateConstant = Expression.Constant(fromDate.Value);
                expressions.Add(Expression.GreaterThanOrEqual(dateProperty, dateConstant));
            }

            if (toDate.HasValue)
            {
                var dateProperty = Expression.Property(parameter, nameof(Order.OrderDate));
                var dateConstant = Expression.Constant(toDate.Value);
                expressions.Add(Expression.LessThanOrEqual(dateProperty, dateConstant));
            }

            // Minimum total filter
            if (minTotal.HasValue)
            {
                var totalProperty = Expression.Property(parameter, nameof(Order.Total));
                var totalConstant = Expression.Constant(minTotal.Value);
                expressions.Add(Expression.GreaterThanOrEqual(totalProperty, totalConstant));
            }

            // Customer email filter
            if (!string.IsNullOrEmpty(customerEmail))
            {
                var customerProperty = Expression.Property(parameter, nameof(Order.Customer));
                var emailProperty = Expression.Property(customerProperty, nameof(Customer.Email));
                var emailConstant = Expression.Constant(customerEmail);
                var containsMethod = typeof(string).GetMethod("Contains",
                    new[] { typeof(string) });
                expressions.Add(Expression.Call(emailProperty, containsMethod, emailConstant));
            }

            if (expressions.Count == 0)
                return o => true;

            Expression combined = expressions[0];
            foreach (var expr in expressions.Skip(1))
                combined = Expression.AndAlso(combined, expr);

            return Expression.Lambda<Func<Order, bool>>(combined, parameter);
        }
    }
}
```

### Admin Filter & Authorization

```csharp
namespace HON.Orders.Web.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class ExecutionTimeFilterAttribute : ActionFilterAttribute
    {
        private Stopwatch _stopwatch;

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            _stopwatch = Stopwatch.StartNew();
            base.OnActionExecuting(context);
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            _stopwatch.Stop();
            var elapsedMs = _stopwatch.ElapsedMilliseconds;
            context.HttpContext.Response.Headers.Add("Server-Timing",
                $"total;dur={elapsedMs}");
            Console.WriteLine($"[{context.ActionDescriptor.DisplayName}] Executed in {elapsedMs}ms");
            base.OnActionExecuted(context);
        }
    }

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AdminRoleCheckAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity.IsAuthenticated || !user.HasClaim("role", "Admin"))
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
```

### Custom Tag Helper

```csharp
namespace HON.Orders.Web.TagHelpers
{
    [HtmlTargetElement("currency")]
    public class CurrencyFormatterTagHelper : TagHelper
    {
        [HtmlAttributeName("value")]
        public decimal Value { get; set; }

        [HtmlAttributeName("currency")]
        public string Currency { get; set; } = "USD";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var money = new Money(Value, Currency);
            output.TagName = null;
            output.Content.SetContent(money.ToString());
        }
    }
}
```

---

## Test Examples

### MoneyTests

```csharp
namespace HON.Orders.Tests
{
    public class MoneyTests
    {
        [Fact]
        public void Constructor_WithValidAmount_CreatesInstance()
        {
            // Arrange & Act
            var money = new Money(99.99m, "USD");

            // Assert
            Assert.Equal(99.99m, money.Amount);
            Assert.Equal("USD", money.Currency);
        }

        [Fact]
        public void Constructor_WithNegativeAmount_ThrowsArgumentException()
        {
            // Act & Assert
            Assert.Throws<ArgumentException>(() => new Money(-10m, "USD"));
        }

        [Theory]
        [InlineData(10, 5, 15)]
        [InlineData(100, 25, 125)]
        public void Addition_TwoMoneyObjects_ReturnsSumWithCorrectCurrency(
            decimal amt1, decimal amt2, decimal expected)
        {
            // Arrange
            var money1 = new Money(amt1, "USD");
            var money2 = new Money(amt2, "USD");

            // Act
            var result = money1 + money2;

            // Assert
            Assert.Equal(expected, result.Amount);
            Assert.Equal("USD", result.Currency);
        }
    }
}
```

### OrderServiceTests

```csharp
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
            // Arrange & Act
            var result = _service.GetTopCustomersByRevenue(30, 5).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Alice", result[0].CustomerName);
            Assert.True(result[0].Revenue > 0);
        }

        [Fact]
        public async Task StreamOrdersAsync_YieldsResultsInPages()
        {
            // Arrange
            var since = DateTime.UtcNow.AddDays(-60);
            var orders = new List<Order>();

            // Act
            await foreach (var order in _service.StreamOrdersAsync(since, pageSize: 2))
            {
                orders.Add(order);
            }

            // Assert
            Assert.True(orders.Count > 0);
        }

        private void SeedTestData()
        {
            var customer = new Customer { Name = "Alice", Email = "alice@example.com" };
            var product = new Product { Name = "Widget", Sku = "WID001", UnitPrice = 99.99m };

            _context.Customers.Add(customer);
            _context.Products.Add(product);
            _context.SaveChanges();

            var order = new Order
            {
                OrderNumber = "ORD-001",
                CustomerId = customer.Id,
                OrderDate = DateTime.UtcNow.AddDays(-5)
            };

            _context.Orders.Add(order);
            _context.SaveChanges();

            var item = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = 2,
                UnitPrice = product.UnitPrice
            };

            _context.OrderItems.Add(item);
            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}
```

---

## README.md Template

```markdown
# HON Orders — ASP.NET Core MVC Assessment Solution

## Overview

A mini order-management MVC web application demonstrating competency in C#, LINQ, EF Core, ASP.NET Core MVC, and xUnit testing.

## Project Structure

- **HON.Orders.Domain**: Business entities, value objects, services, and DTOs
- **HON.Orders.Data**: EF Core DbContext, migrations, and database configuration
- **HON.Orders.Web**: ASP.NET Core MVC controllers, views, filters, and tag helpers
- **HON.Orders.Tests**: xUnit unit and integration tests

## Prerequisites

- .NET 8.0 SDK or later
- SQL Server (LocalDB, Express, or Standard)
- Git

## Setup Instructions

### 1. Restore NuGet Packages

```bash
dotnet restore
```

### 2. Configure Database Connection

Edit `HON.Orders.Web/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HonOrders;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

### 3. Run Migrations

```bash
cd HON.Orders.Data
dotnet ef database update
```

### 4. Run Tests

```bash
cd ../HON.Orders.Tests
dotnet test
```

### 5. Run Web Application

```bash
cd ../HON.Orders.Web
dotnet run
```

Navigate to `https://localhost:5001`

## Features

- ✅ Responsive MVC layout with Bootstrap
- ✅ Product catalog browsing
- ✅ Order creation with dynamic line items
- ✅ Admin area for product CRUD
- ✅ Soft delete for logical data preservation
- ✅ Concurrency control via RowVersion
- ✅ LINQ queries for business analytics
- ✅ Custom validation and tag helpers
- ✅ Comprehensive unit tests

## Key Implementation Highlights

### C# & LINQ
- Immutable `Money` value object with operators
- Top 5 customers query using GroupBy/SelectMany
- Async stream pagination
- Dynamic predicates with expression trees

### EF Core
- Fluent API configuration with relationships
- Concurrency tokens (RowVersion)
- Soft delete with global query filters
- Shadow properties for audit trails

### ASP.NET Core MVC
- ExecutionTime filter with Server-Timing header
- AdminRoleCheck authorization filter
- Admin CRUD with antiforgery protection
- PRG (Post/Redirect/Get) pattern
- Custom CurrencyFormatter tag helper
- Unobtrusive client-side validation
- Dynamic form line items

### Testing
- 10+ unit tests using AAA pattern
- In-memory database for integration tests
- Theory-based parameterized tests

## Sample Credentials

Admin area requires Admin role claim:
- Username: `admin@example.com`
- Role: `Admin`

(Configure in Program.cs for development)

## Common Commands

```bash
# Add migration
dotnet ef migrations add YourMigrationName -p HON.Orders.Data

# Update database
dotnet ef database update -p HON.Orders.Data

# Drop database
dotnet ef database drop -p HON.Orders.Data

# Run all tests with verbose output
dotnet test --verbosity detailed

# Run specific test
dotnet test --filter "MoneyTests"
```

## API Endpoints (Not used — MVC-only)

This solution uses **ASP.NET Core MVC with server-side rendering only**. No Web API endpoints are implemented.

## Troubleshooting

**Q: "Cannot connect to SQL Server"**  
A: Ensure SQL Server is running and connection string is correct in appsettings.json

**Q: "Migration failing with duplicate key error"**  
A: Run `dotnet ef database drop` then `dotnet ef database update`

**Q: "Admin area returns 403 Forbidden"**  
A: Ensure user has Admin claim set in Program.cs (development only)

## License

Assessment solution. For evaluation purposes only.
```

---

This template provides assessors with a clear picture of what the final solution should look like, and helps candidates understand the expected implementation patterns and structure.
