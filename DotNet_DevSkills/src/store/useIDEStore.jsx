import create from 'zustand';

const initialFiles = [
  {
    id: 'solution',
    name: 'HON.Orders.sln',
    path: 'HON.Orders.sln',
    readOnly: true,
    content: `Microsoft Visual Studio Solution File, Format Version 12.00`
  },
  {
    id: 'domain-customer',
    name: 'Customer.cs',
    path: 'HON.Orders.Domain/Entities/Customer.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;

    public List<Order> Orders { get; set; } = new();
}`
  },
  {
    id: 'domain-product',
    name: 'Product.cs',
    path: 'HON.Orders.Domain/Entities/Product.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public class Product : ISoftDelete
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public string Category { get; set; } = null!;
    public int StockQuantity { get; set; }
    public byte[]? RowVersion { get; set; }
    public bool IsDeleted { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
}`
  },
  {
    id: 'domain-order',
    name: 'Order.cs',
    path: 'HON.Orders.Domain/Entities/Order.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public class Order : ISoftDelete
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = null!;
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "New";
    public decimal Total { get; set; }
    public byte[]? RowVersion { get; set; }
    public bool IsDeleted { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
    public Payment? Payment { get; set; }
}`
  },
  {
    id: 'domain-orderitem',
    name: 'OrderItem.cs',
    path: 'HON.Orders.Domain/Entities/OrderItem.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}`
  },
  {
    id: 'domain-payment',
    name: 'Payment.cs',
    path: 'HON.Orders.Domain/Entities/Payment.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = null!;
    public DateTime PaidAt { get; set; }
}`
  },
  {
    id: 'domain-auditlog',
    name: 'AuditLog.cs',
    path: 'HON.Orders.Domain/Entities/AuditLog.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public string EntityName { get; set; } = null!;
    public string EntityId { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string Username { get; set; } = null!;
    public DateTime OccurredAt { get; set; }
    public string Details { get; set; } = null!;
}`
  },
  {
    id: 'domain-isoftdelete',
    name: 'ISoftDelete.cs',
    path: 'HON.Orders.Domain/Entities/ISoftDelete.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Entities;

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
}`
  },
  {
    id: 'domain-money',
    name: 'Money.cs',
    path: 'HON.Orders.Domain/ValueObjects/Money.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.ValueObjects;

public sealed class Money : IEquatable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "USD")
    {
        Amount = amount;
        Currency = currency;
    }

    public override string ToString() => Format();

    public string Format() => string.Format(System.Globalization.CultureInfo.InvariantCulture, "{0:C2}", Amount);

    public static Money operator +(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return new Money(left.Amount - right.Amount, left.Currency);
    }

    public static Money operator *(Money money, decimal multiplier) => new Money(money.Amount * multiplier, money.Currency);
    public static Money operator *(decimal multiplier, Money money) => money * multiplier;
    public static Money operator /(Money money, decimal divisor) => new Money(money.Amount / divisor, money.Currency);

    public static bool operator ==(Money? left, Money? right) => Equals(left, right);
    public static bool operator !=(Money? left, Money? right) => !Equals(left, right);

    public override bool Equals(object? obj) => Equals(obj as Money);

    public bool Equals(Money? other) => other is not null && Amount == other.Amount && Currency == other.Currency;

    public override int GetHashCode() => HashCode.Combine(Amount, Currency);

    private static void EnsureSameCurrency(Money left, Money right)
    {
        if (!string.Equals(left.Currency, right.Currency, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Cannot operate on Money values with different currencies.");
        }
    }
}`
  },
  {
    id: 'domain-decimal-extension',
    name: 'DecimalMoneyExtensions.cs',
    path: 'HON.Orders.Domain/Extensions/DecimalMoneyExtensions.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Extensions;

using HON.Orders.Domain.ValueObjects;

// task1.1 - Decimal extension to convert decimals to Money objects
public static class DecimalMoneyExtensions
{
    public static Money FormatMoney(this decimal value, string currency = "USD") => new Money(value, currency);
}`
  },
  {
    id: 'domain-orderfilterbuilder',
    name: 'OrderFilterBuilder.cs',
    path: 'HON.Orders.Domain/Filters/OrderFilterBuilder.cs',
    readOnly: false,
    content: `namespace HON.Orders.Domain.Filters;

using System.Linq.Expressions;
using HON.Orders.Domain.Entities;

// task1.4 - Build dynamic order predicates for optional criteria
public static class OrderFilterBuilder
{
    public static Expression<Func<Order, bool>> Build(
        string? status,
        DateTime? from,
        DateTime? to,
        decimal? minTotal,
        string? customerEmail)
    {
        Expression<Func<Order, bool>> filter = x => true;

        if (!string.IsNullOrWhiteSpace(status))
        {
            filter = filter.And(x => x.Status == status);
        }

        if (from is DateTime fromDate)
        {
            filter = filter.And(x => x.OrderDate >= fromDate);
        }

        if (to is DateTime toDate)
        {
            filter = filter.And(x => x.OrderDate <= toDate);
        }

        if (minTotal.HasValue)
        {
            filter = filter.And(x => x.Total >= minTotal.Value);
        }

        if (!string.IsNullOrWhiteSpace(customerEmail))
        {
            filter = filter.And(x => x.Customer != null && x.Customer.Email == customerEmail);
        }

        return filter;
    }

    private static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> left, Expression<Func<T, bool>> right)
    {
        var param = Expression.Parameter(typeof(T));
        var leftBody = Expression.Invoke(left, param);
        var rightBody = Expression.Invoke(right, param);
        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(leftBody, rightBody), param);
    }
}`
  },
  {
    id: 'data-context',
    name: 'HonOrdersDbContext.cs',
    path: 'HON.Orders.Data/HonOrdersDbContext.cs',
    readOnly: false,
    content: `using HON.Orders.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Data;

// task2.1 / task2.2 - Configure EF Core model, relationships, precision, concurrency, shadow props, and soft delete filters
public class HonOrdersDbContext : DbContext
{
    public HonOrdersDbContext(DbContextOptions<HonOrdersDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Email).IsRequired().HasMaxLength(200);
            builder.HasMany(x => x.Orders).WithOne(x => x.Customer).HasForeignKey(x => x.CustomerId);
        });

        modelBuilder.Entity<Product>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Sku).IsRequired().HasMaxLength(50);
            builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
            builder.Property(x => x.Category).HasMaxLength(100);
            builder.Property(x => x.RowVersion).IsRowVersion();
            builder.Property<bool>("IsDeleted").HasDefaultValue(false);
            builder.Property<string>("CreatedBy").HasMaxLength(100);
            builder.Property<DateTime>("LastModified");
            builder.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder.Entity<Order>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.OrderNumber).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Total).HasPrecision(18, 2);
            builder.Property(x => x.RowVersion).IsRowVersion();
            builder.Property<bool>("IsDeleted").HasDefaultValue(false);
            builder.Property<string>("CreatedBy").HasMaxLength(100);
            builder.Property<DateTime>("LastModified");
            builder.HasQueryFilter(x => !x.IsDeleted);
            builder.HasMany(x => x.OrderItems).WithOne(x => x.Order).HasForeignKey(x => x.OrderId);
            builder.HasOne(x => x.Payment).WithOne(x => x.Order!).HasForeignKey<Payment>(x => x.OrderId);
        });

        modelBuilder.Entity<OrderItem>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
            builder.Property(x => x.LineTotal).HasPrecision(18, 2);
            builder.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Payment>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Method).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<AuditLog>(builder =>
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.EntityName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.EntityId).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Action).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Username).IsRequired().HasMaxLength(100);
            builder.Property(x => x.OccurredAt).IsRequired();
            builder.Property(x => x.Details).IsRequired();
        });
    }
}`
  },
  {
    id: 'data-extensions',
    name: 'DbContextExtensions.cs',
    path: 'HON.Orders.Data/Extensions/DbContextExtensions.cs',
    readOnly: false,
    content: `using HON.Orders.Domain.Entities;
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
}`
  },
  {
    id: 'data-queryservice',
    name: 'OrderQueryService.cs',
    path: 'HON.Orders.Data/Services/OrderQueryService.cs',
    readOnly: false,
    content: `using HON.Orders.Domain.Entities;
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
}`
  },
  {
    id: 'web-program',
    name: 'Program.cs',
    path: 'HON.Orders.Web/Program.cs',
    readOnly: false,
    content: `using HON.Orders.Data;
using HON.Orders.Data.Extensions;
using HON.Orders.Web.Filters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add<ExecutionTimingFilter>();
});

builder.Services.AddDbContext<HonOrdersDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HonOrders") ?? "Server=(localdb)\mssqllocaldb;Database=HonOrdersDb;Trusted_Connection=True;"));

builder.Services.AddScoped<ExecutionTimingFilter>();
 builder.Services.AddScoped<AdminRoleFilter>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<HonOrdersDbContext>();
    context.Database.EnsureCreated();
    await context.SeedAsync();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();`
  },
  {
    id: 'web-homecontroller',
    name: 'HomeController.cs',
    path: 'HON.Orders.Web/Controllers/HomeController.cs',
    readOnly: false,
    content: `using System.Diagnostics;
using HON.Orders.Data;
using HON.Orders.Data.Services;
using HON.Orders.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers;

public class HomeController : Controller
{
    private readonly OrderQueryService _queryService;
    private readonly HonOrdersDbContext _context;

    public HomeController(OrderQueryService queryService, HonOrdersDbContext context)
    {
        _queryService = queryService;
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var since = DateTime.UtcNow.AddDays(-30);
        var topCustomers = await _queryService.GetTopCustomersByRevenueAsync(since);
        var recentOrders = await _context.Orders
            .OrderByDescending(x => x.OrderDate)
            .Take(5)
            .Select(x => new RecentOrderViewModel
            {
                OrderNumber = x.OrderNumber,
                CustomerName = x.Customer != null ? x.Customer.Name : "Unknown",
                OrderDate = x.OrderDate,
                Total = x.Total,
                Status = x.Status
            })
            .ToListAsync();

        var model = new HomeIndexViewModel
        {
            TopCustomers = topCustomers.Select(x => new TopCustomerViewModel
            {
                CustomerName = x.CustomerName,
                OrdersCount = x.OrdersCount,
                Revenue = x.Revenue
            }).ToList(),
            RecentOrders = recentOrders
        };

        return View(model);
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}`
  },
  {
    id: 'web-ordercontroller',
    name: 'OrderController.cs',
    path: 'HON.Orders.Web/Controllers/OrderController.cs',
    readOnly: false,
    content: `using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using HON.Orders.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers;

// task3.4 - Customer order form with dynamic line items and validation
public class OrderController : Controller
{
    private readonly HonOrdersDbContext _context;

    public OrderController(HonOrdersDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Create()
    {
        var customers = await _context.Customers.AsNoTracking().ToListAsync();
        var products = await _context.Products.AsNoTracking().ToListAsync();

        return View(new CreateOrderModel
        {
            Customers = customers,
            Products = products,
            LineItems = new List<OrderLineItemModel> { new() }
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateOrderModel model)
    {
        if (!ModelState.IsValid)
        {
            model.Customers = await _context.Customers.AsNoTracking().ToListAsync();
            model.Products = await _context.Products.AsNoTracking().ToListAsync();
            return View(model);
        }

        var order = new Order
        {
            OrderNumber = $"HON-{DateTime.UtcNow:yyyyMMddHHmmss}",
            CustomerId = model.CustomerId,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            Total = model.LineItems.Sum(x => x.Quantity * x.UnitPrice)
        };

        order.OrderItems.AddRange(model.LineItems.Select(item => new OrderItem
        {
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            LineTotal = item.Quantity * item.UnitPrice
        }));

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        TempData["Message"] = "Order created successfully.";
        return RedirectToAction(nameof(Create));
    }
}`
  },
  {
    id: 'web-admin-products',
    name: 'ProductsController.cs',
    path: 'HON.Orders.Web/Areas/Admin/Controllers/ProductsController.cs',
    readOnly: false,
    content: `using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using HON.Orders.Web.Models.Admin;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Areas.Admin.Controllers;

[Area("Admin")]
// task3.3 - Admin CRUD operations for Products with PRG and TempData notifications
public class ProductsController : Controller
{
    private readonly HonOrdersDbContext _context;

    public ProductsController(HonOrdersDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var products = await _context.Products.AsNoTracking().ToListAsync();
        return View(products);
    }

    public IActionResult Create()
    {
        return View(new ProductEditModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ProductEditModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var product = new Product
        {
            Name = model.Name,
            Sku = model.Sku,
            UnitPrice = model.UnitPrice,
            Category = model.Category,
            StockQuantity = model.StockQuantity
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        TempData["Message"] = "Product created successfully.";
        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        return View(new ProductEditModel
        {
            Id = product.Id,
            Name = product.Name,
            Sku = product.Sku,
            UnitPrice = product.UnitPrice,
            Category = product.Category,
            StockQuantity = product.StockQuantity
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(ProductEditModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var product = await _context.Products.FindAsync(model.Id);
        if (product is null)
        {
            return NotFound();
        }

        product.Name = model.Name;
        product.Sku = model.Sku;
        product.UnitPrice = model.UnitPrice;
        product.Category = model.Category;
        product.StockQuantity = model.StockQuantity;

        await _context.SaveChangesAsync();

        TempData["Message"] = "Product updated successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        product.IsDeleted = true;
        await _context.SaveChangesAsync();

        TempData["Message"] = "Product deleted successfully.";
        return RedirectToAction(nameof(Index));
    }
}`
  },
  {
    id: 'web-view-home',
    name: 'Index.cshtml',
    path: 'HON.Orders.Web/Views/Home/Index.cshtml',
    readOnly: false,
    content: `@* task1.2 / task1.3 - Dashboard view for top customers and recent orders *@
@model HON.Orders.Web.Models.HomeIndexViewModel

@{
    ViewData["Title"] = "HON Orders Dashboard";
}

<div class="row mb-5">
    <div class="col-md-8">
        <h1>HON Orders Dashboard</h1>
        <p class="lead">Monitor recent orders, top customers, and launch the admin product catalog.</p>
    </div>
    <div class="col-md-4 text-md-end">
        <a asp-area="Admin" asp-controller="Products" asp-action="Index" class="btn btn-primary">Admin Product List</a>
        <a asp-controller="Order" asp-action="Create" class="btn btn-outline-secondary">Create Order</a>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-6">
        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="card-title">Top Customers</h2>
                <table class="table table-sm mt-3">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Orders</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach (var customer in Model.TopCustomers)
                        {
                            <tr>
                                <td>@customer.CustomerName</td>
                                <td>@customer.OrdersCount</td>
                                <td>@customer.Revenue.ToString("C2")</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="card-title">Recent Orders</h2>
                <table class="table table-sm mt-3">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach (var order in Model.RecentOrders)
                        {
                            <tr>
                                <td>@order.OrderNumber</td>
                                <td>@order.CustomerName</td>
                                <td>@order.OrderDate.ToString("yyyy-MM-dd")</td>
                                <td>@order.Total.ToString("C2")</td>
                                <td>@order.Status</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>`
  },
  {
    id: 'web-model-homeview',
    name: 'HomeIndexViewModel.cs',
    path: 'HON.Orders.Web/Models/HomeIndexViewModel.cs',
    readOnly: false,
    content: `using HON.Orders.Domain.Entities;

namespace HON.Orders.Web.Models;

public class HomeIndexViewModel
{
    public List<TopCustomerViewModel> TopCustomers { get; set; } = new();
    public List<RecentOrderViewModel> RecentOrders { get; set; } = new();
}

public sealed class TopCustomerViewModel
{
    public string CustomerName { get; set; } = null!;
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
}

public sealed class RecentOrderViewModel
{
    public string OrderNumber { get; set; } = null!;
    public string CustomerName { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = null!;
}`
  },
  {
    id: 'web-model-createorder',
    name: 'CreateOrderModel.cs',
    path: 'HON.Orders.Web/Models/CreateOrderModel.cs',
    readOnly: false,
    content: `using System.ComponentModel.DataAnnotations;
using HON.Orders.Domain.Entities;

namespace HON.Orders.Web.Models;

public class CreateOrderModel
{
    [Required]
    public int CustomerId { get; set; }

    public List<Customer> Customers { get; set; } = new();

    public List<Product> Products { get; set; } = new();

    public List<OrderLineItemModel> LineItems { get; set; } = new();
}`
  },
  {
    id: 'web-model-orderlineitem',
    name: 'OrderLineItemModel.cs',
    path: 'HON.Orders.Web/Models/OrderLineItemModel.cs',
    readOnly: false,
    content: `using System.ComponentModel.DataAnnotations;

namespace HON.Orders.Web.Models;

public class OrderLineItemModel
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    [Required]
    public decimal UnitPrice { get; set; }
}`
  },
  {
    id: 'web-admin-productedit',
    name: 'ProductEditModel.cs',
    path: 'HON.Orders.Web/Models/Admin/ProductEditModel.cs',
    readOnly: false,
    content: `using System.ComponentModel.DataAnnotations;

namespace HON.Orders.Web.Models.Admin;

public class ProductEditModel
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Sku { get; set; } = null!;

    [Required]
    [DataType(DataType.Currency)]
    public decimal UnitPrice { get; set; }

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = null!;

    [Required]
    public int StockQuantity { get; set; }
}`
  },
  {
    id: 'web-filter-execution',
    name: 'ExecutionTimingFilter.cs',
    path: 'HON.Orders.Web/Filters/ExecutionTimingFilter.cs',
    readOnly: false,
    content: `using Microsoft.AspNetCore.Mvc.Filters;

namespace HON.Orders.Web.Filters;

// task3.2 - Log execution time and add Server-Timing header
public class ExecutionTimingFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        context.HttpContext.Items["ActionStart"] = DateTime.UtcNow;
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.HttpContext.Items.TryGetValue("ActionStart", out var startObj)
            && startObj is DateTime start)
        {
            var duration = DateTime.UtcNow - start;
            context.HttpContext.Response.Headers["Server-Timing"] = $"app;dur={duration.TotalMilliseconds:F0}";
        }
    }
}`
  },
  {
    id: 'web-filter-adminrole',
    name: 'AdminRoleFilter.cs',
    path: 'HON.Orders.Web/Filters/AdminRoleFilter.cs',
    readOnly: false,
    content: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HON.Orders.Web.Filters;

// task3.2 - Authorization filter for Admin area role checks
public class AdminRoleFilter : IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new ForbidResult();
            return;
        }

        if (!user.IsInRole("Admin"))
        {
            context.Result = new ForbidResult();
        }
    }
}`
  }
];

const useIDEStore = create((set) => ({
  activeFileId: 'web-program',
  files: initialFiles,
  activeOutputTab: 'output',
  activeRightTab: 'problem',
  outputLines: ['Ready to run your code.'],
  testLines: ['Test runner is ready.'],
  submissionLines: ['Submission summary will appear here.'],
  unsavedChanges: false,
  fullscreen: false,
  timerSeconds: 4500,
  setActiveFile: (id) => set({ activeFileId: id }),
  updateFileContent: (id, content) =>
    set((state) => ({
      files: state.files.map((file) => (file.id === id ? { ...file, content } : file)),
      unsavedChanges: true
    })),
  setActiveOutputTab: (tab) => set({ activeOutputTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  setOutputLines: (lines) => set({ outputLines: lines }),
  setTestLines: (lines) => set({ testLines: lines }),
  setSubmissionLines: (lines) => set({ submissionLines: lines }),
  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  saveChanges: () => set({ unsavedChanges: false }),
  resetEditor: () => set({ files: initialFiles, activeFileId: 'web-program', unsavedChanges: false }),
  refreshFiles: () => set({ files: initialFiles, outputLines: ['File tree refreshed.'], unsavedChanges: false })
}));

export default useIDEStore;
