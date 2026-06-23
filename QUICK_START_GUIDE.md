# HON Orders Assessment — Quick Start Guide

## Getting Started (First 5 minutes)

### Step 1: Create the Solution

```bash
dotnet new globaljson --sdk-version 8.0 --roll-forward latestMinor
dotnet new sln -n HON.Orders

# Create projects
dotnet new classlib -n HON.Orders.Domain -f net8.0
dotnet new classlib -n HON.Orders.Data -f net8.0
dotnet new mvc -n HON.Orders.Web -f net8.0
dotnet new xunit -n HON.Orders.Tests -f net8.0

# Add to solution
dotnet sln add HON.Orders.Domain/HON.Orders.Domain.csproj
dotnet sln add HON.Orders.Data/HON.Orders.Data.csproj
dotnet sln add HON.Orders.Web/HON.Orders.Web.csproj
dotnet sln add HON.Orders.Tests/HON.Orders.Tests.csproj
```

### Step 2: Add Project Dependencies

**HON.Orders.Data:**
```bash
cd HON.Orders.Data
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add reference ../HON.Orders.Domain/HON.Orders.Domain.csproj
```

**HON.Orders.Web:**
```bash
cd ../HON.Orders.Web
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add reference ../HON.Orders.Domain/HON.Orders.Domain.csproj
dotnet add reference ../HON.Orders.Data/HON.Orders.Data.csproj
```

**HON.Orders.Tests:**
```bash
cd ../HON.Orders.Tests
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add reference ../HON.Orders.Domain/HON.Orders.Domain.csproj
dotnet add reference ../HON.Orders.Data/HON.Orders.Data.csproj
```

### Step 3: Folder Structure

Create folders in `HON.Orders.Domain/`:
```
HON.Orders.Domain/
├── Entities/
│   ├── Customer.cs
│   ├── Product.cs
│   ├── Order.cs
│   ├── OrderItem.cs
│   ├── Payment.cs
│   └── AuditLog.cs
├── ValueObjects/
│   └── Money.cs
├── DTOs/
│   ├── TopCustomerDto.cs
│   └── ProductViewModel.cs
├── Filters/
│   └── OrderFilterBuilder.cs
└── Services/
    └── OrderService.cs
```

Create folders in `HON.Orders.Data/`:
```
HON.Orders.Data/
├── AppDbContext.cs
├── Migrations/
└── SeedData.cs (optional)
```

Create folders in `HON.Orders.Web/`:
```
HON.Orders.Web/
├── Areas/Admin/
│   ├── Controllers/
│   │   └── ProductController.cs
│   └── Views/Product/
│       ├── Index.cshtml
│       ├── Create.cshtml
│       ├── Edit.cshtml
│       └── Delete.cshtml
├── Controllers/
│   ├── HomeController.cs
│   ├── OrderController.cs
│   └── CatalogController.cs
├── Filters/
│   ├── ExecutionTimeFilterAttribute.cs
│   └── AdminRoleCheckAttribute.cs
├── TagHelpers/
│   └── CurrencyFormatterTagHelper.cs
└── Models/
    └── OrderViewModel.cs
```

---

## Implementation Order (Recommended)

### **Phase 1: Domain & Data (20 min)**
1. Define entities in `Domain/Entities/`
2. Create `Money` value object
3. Create `AppDbContext`
4. Run migrations: `dotnet ef migrations add InitialCreate`
5. Test: `dotnet build` (no errors)

### **Phase 2: Services & Filters (15 min)**
1. Implement `OrderService` with LINQ queries
2. Implement `OrderFilterBuilder`
3. Create unit tests for services
4. Run: `dotnet test`

### **Phase 3: Web Controllers (30 min)**
1. Create `HomeController` with dashboard
2. Create `CatalogController` (GET catalog, product details)
3. Create `OrderController` (GET orders, POST create order)
4. Create Admin `ProductController` (full CRUD)

### **Phase 4: Views & Layout (20 min)**
1. Create `_Layout.cshtml`
2. Create partial views & components
3. Create order form with dynamic line items
4. Add Bootstrap styling

### **Phase 5: Filters & Enhancements (5 min)**
1. Implement `ExecutionTimeFilter`
2. Implement `AdminRoleCheck`
3. Apply to Admin controllers

---

## Key Patterns & Code Snippets

### Money Value Object Skeleton

```csharp
namespace HON.Orders.Domain.ValueObjects
{
    public class Money
    {
        public decimal Amount { get; }
        public string Currency { get; }

        public Money(decimal amount, string currency)
        {
            if (amount < 0)
                throw new ArgumentException("Amount cannot be negative.");
            Amount = amount;
            Currency = currency ?? "USD";
        }

        public override string ToString() => $"{Currency} {Amount:F2}";

        public static Money operator +(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException("Currencies must match.");
            return new Money(a.Amount + b.Amount, a.Currency);
        }

        // Implement: -, *, /, Equals, GetHashCode
    }

    public static class DecimalExtensions
    {
        public static string FormatMoney(this decimal amount, string currency = "USD")
        {
            return new Money(amount, currency).ToString();
        }
    }
}
```

### Order Service Skeleton

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
                .Where(o => o.OrderDate >= since && !o.IsDeleted)
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
                    .Where(o => o.OrderDate >= since && !o.IsDeleted)
                    .OrderByDescending(o => o.OrderDate)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync(ct);

                if (orders.Count == 0)
                    break;

                foreach (var order in orders)
                    yield return order;

                skip += pageSize;
            }
        }
    }
}
```

### DbContext Configuration Skeleton

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

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder mb)
        {
            base.OnModelCreating(mb);

            // Relationships
            mb.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Concurrency
            mb.Entity<Product>()
                .Property(p => p.RowVersion)
                .IsRowVersion();

            mb.Entity<Order>()
                .Property(o => o.RowVersion)
                .IsRowVersion();

            // Shadow properties
            foreach (var entity in mb.Model.GetEntityTypes())
            {
                if (typeof(IHasSoftDelete).IsAssignableFrom(entity.ClrType))
                {
                    mb.Entity(entity.ClrType)
                        .HasQueryFilter(CreateFilterExpression(entity.ClrType));
                }
                
                mb.Entity(entity.ClrType)
                    .Property<DateTime>("CreatedAt")
                    .HasDefaultValueSql("GETUTCDATE()");
            }
        }

        private static LambdaExpression CreateFilterExpression(Type type)
        {
            var param = Expression.Parameter(type, "p");
            var body = Expression.Equal(
                Expression.Property(param, "IsDeleted"),
                Expression.Constant(false));
            return Expression.Lambda(body, param);
        }
    }

    public interface IHasSoftDelete
    {
        bool IsDeleted { get; set; }
    }
}
```

### Execution Time Filter

```csharp
namespace HON.Orders.Web.Filters
{
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
            Console.WriteLine($"Action executed in {elapsedMs}ms");
            base.OnActionExecuted(context);
        }
    }
}
```

---

## Database Setup

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HonOrders;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

### Program.cs Setup

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("HON.Orders.Data")));

// Add services
builder.Services.AddScoped<OrderService>();

// Add MVC
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapAreaControllerRoute(
        name: "admin",
        areaName: "admin",
        pattern: "admin/{controller=product}/{action=index}/{id?}");

    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=home}/{action=index}/{id?}");
});

app.Run();
```

---

## Common Pitfalls to Avoid

❌ **Don't:** Hard-code connection strings  
✓ **Do:** Use `appsettings.json` and Configuration

❌ **Don't:** Skip migrations  
✓ **Do:** Track migrations in source control

❌ **Don't:** Implement Web APIs for a "MVC-only" assessment  
✓ **Do:** Use Controllers and Views

❌ **Don't:** Forget antiforgery tokens on POST forms  
✓ **Do:** Always include `@Html.AntiForgeryToken()`

❌ **Don't:** Leave validation only on client-side  
✓ **Do:** Validate on server-side too

❌ **Don't:** Ignore query filters for soft-deleted records  
✓ **Do:** Configure global query filters in DbContext

---

## Testing Locally

### Run Migrations
```bash
cd HON.Orders.Data
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Run Tests
```bash
cd ../HON.Orders.Tests
dotnet test
```

### Run Web App
```bash
cd ../HON.Orders.Web
dotnet run
# Navigate to: https://localhost:5001
```

---

## Submission Checklist

- [ ] Solution builds without errors
- [ ] All projects compile
- [ ] Database migrations work
- [ ] Unit tests pass (8+ tests)
- [ ] All CRUD operations work in Admin area
- [ ] Order form has dynamic line items
- [ ] Validation displays correctly
- [ ] Filters are applied (ExecutionTime, AdminRoleCheck)
- [ ] Tag helpers render correctly
- [ ] README.md included with setup instructions
- [ ] No compiler warnings
- [ ] `.gitignore` excludes bin/obj/vs/.

---

## Reach Out If Stuck

- Check the ASSESSMENT_SPECIFICATION.md for detailed requirements
- Review the grading rubric to prioritize tasks
- Test incrementally as you build
- Use xUnit for early feedback

**Good luck! 🚀**
