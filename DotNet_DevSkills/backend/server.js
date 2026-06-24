import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(backendDir, '..');
const workspaceRoot = path.resolve(frontendRoot, '..');
const assessmentDataPath = path.join(backendDir, 'assessment-data.json');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8787);
const defaultAssessmentKey = 'main-exam';
const fallbackCodeEditorAssessments = [
  {
    key: 'main-exam',
    label: 'Main Exam Code',
    starterRoot: 'MainCode',
    solutionRoot: 'MainCode-Sol',
    solutionFile: 'HON.Academy.sln'
  },
  {
    key: 'hon-orders',
    label: 'HON Orders Code',
    starterRoot: 'testToday-main',
    solutionRoot: 'testToday-main - Sol',
    solutionFile: 'HON.Orders.sln'
  }
];

const textExtensions = new Set(['.cs', '.csproj', '.sln', '.json', '.cshtml', '.css', '.js', '.jsx', '.md', '.config', '.txt', '.xml', '.yml', '.yaml']);
const skipFolders = new Set(['bin', 'obj', '.git', 'node_modules']);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function normalizeAssessmentKey(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCodeEditorConfig(data) {
  const sourceConfig = data?.codeEditor || {};
  const sourceAssessments = Array.isArray(sourceConfig.assessments) && sourceConfig.assessments.length > 0
    ? sourceConfig.assessments
    : fallbackCodeEditorAssessments;

  const assessments = sourceAssessments.map((assessment) => ({
    key: normalizeAssessmentKey(assessment.key),
    label: assessment.label || assessment.key,
    starterRoot: assessment.starterRoot || assessment.workspaceRoot || assessment.root || '',
    solutionRoot: assessment.solutionRoot || assessment.solutionWorkspaceRoot || assessment.starterRoot || assessment.workspaceRoot || assessment.root || '',
    solutionFile: assessment.solutionFile || assessment.solution || ''
  })).filter((assessment) => assessment.key);

  const defaultAssessment = normalizeAssessmentKey(sourceConfig.defaultAssessmentKey) || assessments[0]?.key || defaultAssessmentKey;

  return {
    title: sourceConfig.title || 'Assessment Type',
    defaultAssessmentKey: assessments.some((assessment) => assessment.key === defaultAssessment) ? defaultAssessment : assessments[0]?.key || defaultAssessmentKey,
    assessments
  };
}

function resolveAssessmentConfig(codeEditorConfig, assessmentKey) {
  const normalizedKey = normalizeAssessmentKey(assessmentKey) || codeEditorConfig.defaultAssessmentKey;
  return codeEditorConfig.assessments.find((assessment) => assessment.key === normalizedKey) || codeEditorConfig.assessments[0] || null;
}

function resolveAssessmentRoot(assessmentConfig, mode) {
  if (!assessmentConfig) {
    return null;
  }

  return mode === 'solution'
    ? assessmentConfig.solutionRoot || assessmentConfig.starterRoot
    : assessmentConfig.starterRoot || assessmentConfig.solutionRoot;
}

function resolveAssessmentSolutionFile(assessmentConfig) {
  return assessmentConfig?.solutionFile || '';
}

function appendSolutionOverlay(content, solutionBlock) {
  if (!solutionBlock) {
  return content;
  }

  return `${content}\n\n/*\nSOLUTION REFERENCE\n${solutionBlock.trim()}\n*/\n`;
}

const honOrdersSolutionBlocks = {
  'HON.Orders.Domain/ValueObjects/Money.cs': `namespace HON.Orders.Domain.ValueObjects
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
}`,
  'HON.Orders.Data/AppDbContext.cs': `namespace HON.Orders.Data
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

      modelBuilder.Entity<Customer>()
        .HasIndex(c => c.Email)
        .IsUnique();

      modelBuilder.Entity<Product>()
        .Property(p => p.UnitPrice)
        .HasPrecision(18, 2);

      modelBuilder.Entity<Product>()
        .Property(p => p.RowVersion)
        .IsRowVersion();

      modelBuilder.Entity<Order>()
        .HasIndex(o => o.OrderNumber)
        .IsUnique();

      modelBuilder.Entity<Order>()
        .Property(o => o.Total)
        .HasPrecision(18, 2);

      modelBuilder.Entity<Order>()
        .Property(o => o.RowVersion)
        .IsRowVersion();

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

      modelBuilder.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted);
      modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
      modelBuilder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);
      modelBuilder.Entity<OrderItem>().HasQueryFilter(oi => !oi.IsDeleted);
      modelBuilder.Entity<Payment>().HasQueryFilter(p => !p.IsDeleted);

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
}`,
  'HON.Orders.Domain/Services/OrderService.cs': `namespace HON.Orders.Domain.Services
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
}`,
  'HON.Orders.Domain/Filters/OrderFilterBuilder.cs': `namespace HON.Orders.Domain.Filters
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

      if (!string.IsNullOrEmpty(status))
      {
        if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
        {
          var statusProperty = Expression.Property(parameter, nameof(Order.Status));
          var statusConstant = Expression.Constant(orderStatus);
          expressions.Add(Expression.Equal(statusProperty, statusConstant));
        }
      }

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

      if (minTotal.HasValue)
      {
        var totalProperty = Expression.Property(parameter, nameof(Order.Total));
        var totalConstant = Expression.Constant(minTotal.Value);
        expressions.Add(Expression.GreaterThanOrEqual(totalProperty, totalConstant));
      }

      if (!string.IsNullOrEmpty(customerEmail))
      {
        var customerProperty = Expression.Property(parameter, nameof(Order.Customer));
        var emailProperty = Expression.Property(customerProperty, nameof(Customer.Email));
        var emailConstant = Expression.Constant(customerEmail);
        var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
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
}`,
  'HON.Orders.Web/Filters/ExecutionTimeFilterAttribute.cs': `namespace HON.Orders.Web.Filters
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
      context.HttpContext.Response.Headers.Add("Server-Timing", $"total;dur={elapsedMs}");
      Console.WriteLine($"[{context.ActionDescriptor.DisplayName}] Executed in {elapsedMs}ms");
      base.OnActionExecuted(context);
    }
  }
}`,
  'HON.Orders.Web/Filters/AdminRoleCheckAttribute.cs': `namespace HON.Orders.Web.Filters
{
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
}`,
  'HON.Orders.Web/TagHelpers/CurrencyFormatterTagHelper.cs': `namespace HON.Orders.Web.TagHelpers
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
}`,
  'HON.Orders.Tests/MoneyTests.cs': `namespace HON.Orders.Tests
{
  public class MoneyTests
  {
    [Fact]
    public void Constructor_WithValidAmount_CreatesInstance()
    {
      var money = new Money(99.99m, "USD");
      Assert.Equal(99.99m, money.Amount);
      Assert.Equal("USD", money.Currency);
    }

    [Fact]
    public void Constructor_WithNegativeAmount_ThrowsArgumentException()
    {
      Assert.Throws<ArgumentException>(() => new Money(-10m, "USD"));
    }

    [Theory]
    [InlineData(10, 5, 15)]
    [InlineData(100, 25, 125)]
    public void Addition_TwoMoneyObjects_ReturnsSumWithCorrectCurrency(
      decimal amt1, decimal amt2, decimal expected)
    {
      var money1 = new Money(amt1, "USD");
      var money2 = new Money(amt2, "USD");
      var result = money1 + money2;
      Assert.Equal(expected, result.Amount);
      Assert.Equal("USD", result.Currency);
    }
  }
}`,
  'HON.Orders.Tests/OrderServiceTests.cs': `namespace HON.Orders.Tests
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
}`,
  'HON.Orders.Tests/DbContextTests.cs': `namespace HON.Orders.Tests
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
}`,
  'HON.Orders.Web/Program.cs': `using HON.Orders.Data;
using HON.Orders.Domain.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.MigrationsAssembly("HON.Orders.Data")));

builder.Services.AddScoped<OrderService>();

builder.Services.AddControllersWithViews();
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
  var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
  db.Database.Migrate();
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
  name: "admin",
  pattern: "admin/{controller=product}/{action=index}/{id?}",
  defaults: new { area = "Admin" });

app.MapControllerRoute(
  name: "default",
  pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
`,
  'HON.Orders.Web/Controllers/HomeController.cs': `using HON.Orders.Data;
using HON.Orders.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers
{
  public class HomeController : Controller
  {
    private readonly AppDbContext _context;
    private readonly ILogger<HomeController> _logger;

    public HomeController(AppDbContext context, ILogger<HomeController> logger)
    {
      _context = context;
      _logger = logger;
    }

    public IActionResult Index()
    {
      var totalOrders = _context.Orders.Count();
      var pendingOrders = _context.Orders.Count(o => o.Status == OrderStatus.Pending);
      var totalRevenue = _context.Orders.Sum(o => o.Total);
      var recentOrders = _context.Orders
        .Include(o => o.Customer)
        .OrderByDescending(o => o.OrderDate)
        .Take(5)
        .ToList();

      var model = new HomeDashboardViewModel
      {
        TotalOrders = totalOrders,
        PendingOrders = pendingOrders,
        TotalRevenue = totalRevenue,
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
      return View();
    }
  }
}
`,
  'HON.Orders.Web/Controllers/OrderController.cs': `using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using HON.Orders.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers
{
  public class OrderController : Controller
  {
    private readonly AppDbContext _context;

    public OrderController(AppDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public IActionResult Index(int page = 1)
    {
      const int pageSize = 20;
      var orders = _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.OrderItems)
        .OrderByDescending(o => o.OrderDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToList();

      return View(orders);
    }

    [HttpGet]
    public IActionResult Create()
    {
      var customers = _context.Customers.Where(c => !c.IsDeleted).ToList();
      var products = _context.Products.Where(p => !p.IsDeleted).ToList();

      var model = new CreateOrderViewModel
      {
        Customers = customers,
        Products = products,
        LineItems = new List<OrderLineItemViewModel> { new OrderLineItemViewModel() }
      };

      return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(CreateOrderViewModel model)
    {
      if (!ModelState.IsValid)
      {
        model.Customers = _context.Customers.Where(c => !c.IsDeleted).ToList();
        model.Products = _context.Products.Where(p => !p.IsDeleted).ToList();
        return View(model);
      }

      var order = new Order
      {
        OrderNumber = Guid.NewGuid().ToString().Replace("-", "").ToUpperInvariant(),
        CustomerId = model.CustomerId,
        OrderDate = DateTime.UtcNow,
        Status = OrderStatus.Pending,
        Total = model.LineItems.Sum(li => li.Quantity * li.UnitPrice),
        OrderItems = model.LineItems.Select(li => new OrderItem
        {
          ProductId = li.ProductId,
          Quantity = li.Quantity,
          UnitPrice = li.UnitPrice
        }).ToList()
      };

      _context.Orders.Add(order);
      _context.SaveChanges();

      TempData["Success"] = "Order created successfully.";
      return RedirectToAction(nameof(Index));
    }
  }
}
`,
  'HON.Orders.Web/Controllers/CatalogController.cs': `using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers
{
  public class CatalogController : Controller
  {
    private readonly AppDbContext _context;

    public CatalogController(AppDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public IActionResult Index(int page = 1, string? search = null)
    {
      const int pageSize = 20;
      var products = _context.Products.Where(p => !p.IsDeleted);

      if (!string.IsNullOrEmpty(search))
      {
        products = products.Where(p => p.Name.Contains(search) || p.Sku.Contains(search) || p.Category.Contains(search));
      }

      var model = products
        .OrderBy(p => p.Name)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToList();

      return View(model);
    }

    [HttpGet]
    public IActionResult Details(int id)
    {
      var product = _context.Products.FirstOrDefault(p => p.Id == id && !p.IsDeleted);
      if (product == null)
      {
        return NotFound();
      }

      return View(product);
    }
  }
}
`,
  'HON.Orders.Web/Areas/Admin/Controllers/ProductController.cs': `using HON.Orders.Data;
using HON.Orders.Domain.DTOs;
using HON.Orders.Domain.Entities;
using HON.Orders.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Areas.Admin.Controllers
{
  [Area("Admin")]
  [AdminRoleCheck]
  public class ProductController : Controller
  {
    private readonly AppDbContext _context;

    public ProductController(AppDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public IActionResult Index(int page = 1)
    {
      const int pageSize = 20;
      var products = _context.IncludeDeleted<Product>()
        .OrderBy(p => p.Name)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToList();

      return View(products);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(ProductViewModel model)
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
        StockQuantity = model.StockQuantity,
        IsDeleted = false
      };

      _context.Products.Add(product);
      _context.SaveChanges();
      TempData["Success"] = "Product created successfully.";
      return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public IActionResult Edit(int id)
    {
      var product = _context.IncludeDeleted<Product>().FirstOrDefault(p => p.Id == id);
      if (product == null)
      {
        return NotFound();
      }

      var model = new ProductViewModel
      {
        Id = product.Id,
        Name = product.Name,
        Sku = product.Sku,
        UnitPrice = product.UnitPrice,
        Category = product.Category,
        StockQuantity = product.StockQuantity
      };

      return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Edit(int id, ProductViewModel model)
    {
      if (!ModelState.IsValid)
      {
        return View(model);
      }

      var product = _context.IncludeDeleted<Product>().FirstOrDefault(p => p.Id == id);
      if (product == null)
      {
        return NotFound();
      }

      product.Name = model.Name;
      product.Sku = model.Sku;
      product.UnitPrice = model.UnitPrice;
      product.Category = model.Category;
      product.StockQuantity = model.StockQuantity;

      try
      {
        _context.SaveChanges();
        TempData["Success"] = "Product updated successfully.";
      }
      catch (DbUpdateConcurrencyException)
      {
        TempData["Error"] = "The product was modified by another user. Please try again.";
      }

      return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public IActionResult Delete(int id)
    {
      var product = _context.IncludeDeleted<Product>().FirstOrDefault(p => p.Id == id);
      if (product == null)
      {
        return NotFound();
      }

      return View(product);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteConfirmed(int id)
    {
      var product = _context.IncludeDeleted<Product>().FirstOrDefault(p => p.Id == id);
      if (product == null)
      {
        return NotFound();
      }

      product.IsDeleted = true;
      _context.SaveChanges();
      TempData["Success"] = "Product deleted successfully.";
      return RedirectToAction(nameof(Index));
    }
  }
}
`,
  'HON.Orders.Web/Areas/Admin/Views/Product/Create.cshtml': `@model HON.Orders.Domain.DTOs.ProductViewModel

@{
  ViewData["Title"] = "Create Product";
}

<div class="row mb-4">
  <div class="col-md-8">
    <h1>Create Product</h1>
  </div>
</div>

@await Html.PartialAsync("_ValidationSummary")

<form asp-action="Create" method="post" class="needs-validation">
  @Html.AntiForgeryToken()

  <div class="mb-3">
    <label asp-for="Name" class="form-label"></label>
    <input asp-for="Name" class="form-control" />
    <span asp-validation-for="Name" class="text-danger"></span>
  </div>

  <div class="mb-3">
    <label asp-for="Sku" class="form-label"></label>
    <input asp-for="Sku" class="form-control" />
    <span asp-validation-for="Sku" class="text-danger"></span>
  </div>

  <div class="mb-3">
    <label asp-for="UnitPrice" class="form-label"></label>
    <input asp-for="UnitPrice" type="number" step="0.01" class="form-control" />
    <span asp-validation-for="UnitPrice" class="text-danger"></span>
  </div>

  <div class="mb-3">
    <label asp-for="Category" class="form-label"></label>
    <input asp-for="Category" class="form-control" />
    <span asp-validation-for="Category" class="text-danger"></span>
  </div>

  <div class="mb-3">
    <label asp-for="StockQuantity" class="form-label"></label>
    <input asp-for="StockQuantity" type="number" class="form-control" />
    <span asp-validation-for="StockQuantity" class="text-danger"></span>
  </div>

  <div class="d-flex gap-2">
    <button type="submit" class="btn btn-success">Create</button>
    <a asp-action="Index" class="btn btn-secondary">Cancel</a>
  </div>
</form>

@section Scripts {
  <partial name="_ValidationScriptsPartial" />
}
`,
  'HON.Orders.Web/Areas/Admin/Views/Product/Index.cshtml': `@model IEnumerable<HON.Orders.Domain.Entities.Product>

@{
  ViewData["Title"] = "Product Management";
}

<div class="row mb-4">
  <div class="col-md-8">
    <h1>Products</h1>
  </div>
  <div class="col-md-4 text-end">
    <a asp-action="Create" class="btn btn-primary">Add New Product</a>
  </div>
</div>

@if (TempData["Success"] != null)
{
  <div class="alert alert-success">@TempData["Success"]</div>
}
@if (TempData["Error"] != null)
{
  <div class="alert alert-danger">@TempData["Error"]</div>
}

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead class="table-dark">
      <tr>
        <th>Name</th>
        <th>SKU</th>
        <th>Price</th>
        <th>Category</th>
        <th>Stock</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      @foreach (var product in Model)
      {
        <tr>
          <td>@product.Name</td>
          <td>@product.Sku</td>
          <td>@product.UnitPrice.ToString("C")</td>
          <td>@product.Category</td>
          <td>@product.StockQuantity</td>
          <td>@(product.IsDeleted ? "Deleted" : "Active")</td>
          <td>
            <a asp-action="Edit" asp-route-id="@product.Id" class="btn btn-sm btn-secondary">Edit</a>
            <a asp-action="Delete" asp-route-id="@product.Id" class="btn btn-sm btn-danger">Delete</a>
          </td>
        </tr>
      }
    </tbody>
  </table>
</div>
`,
  'HON.Orders.Web/Views/Home/Index.cshtml': `@model HomeDashboardViewModel

@{
  ViewData["Title"] = "Dashboard";
}

<div class="row mb-4">
  <div class="col-md-12">
    <h1>Dashboard</h1>
  </div>
</div>

<div class="row g-4 mb-5">
  <div class="col-md-4">
    <div class="card p-4">
      <h5>Total Orders</h5>
      <p class="display-6">@Model.TotalOrders</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card p-4">
      <h5>Pending Orders</h5>
      <p class="display-6">@Model.PendingOrders</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card p-4">
      <h5>Total Revenue</h5>
      <p class="display-6">@Model.TotalRevenue.ToString("C")</p>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-header">
    Recent Orders
  </div>
  <div class="table-responsive">
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Order #</th>
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
            <td>@order.Customer.Name</td>
            <td>@order.OrderDate.ToString("yyyy-MM-dd")</td>
            <td>@order.Total.ToString("C")</td>
            <td>@order.Status</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</div>
`,
  'HON.Orders.Web/Views/Shared/_Layout.cshtml': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@ViewData["Title"] - HON Orders</title>
  <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="~/css/site.css" />
</head>
<body>
  <header class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container-fluid">
      <a class="navbar-brand" asp-controller="Home" asp-action="Index">HON Orders</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" asp-controller="Home" asp-action="Index">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" asp-controller="Catalog" asp-action="Index">Catalog</a></li>
          <li class="nav-item"><a class="nav-link" asp-controller="Order" asp-action="Index">Orders</a></li>
          <li class="nav-item"><a class="nav-link" asp-area="Admin" asp-controller="Product" asp-action="Index">Admin</a></li>
        </ul>
      </div>
    </div>
  </header>

  <div class="container">
    <main role="main" class="pb-3">
      @RenderBody()
    </main>
  </div>

  <script src="~/lib/jquery/dist/jquery.min.js"></script>
  <script src="~/lib/jquery-validation/dist/jquery.validate.min.js"></script>
  <script src="~/lib/jquery-validation-unobtrusive/dist/jquery.validate.unobtrusive.min.js"></script>
  <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
  <script src="~/js/site.js"></script>

  @RenderSection("Scripts", required: false)
</body>
</html>
`,
  'HON.Orders.Web/wwwroot/js/site.js': `document.addEventListener('DOMContentLoaded', function () {
  const orderForm = document.querySelector('form[action="Create"]');
  if (!orderForm) {
    return;
  }

  orderForm.addEventListener('input', updateOrderTotal);
  orderForm.addEventListener('click', function (event) {
    if (event.target.matches('[data-add-line-item]')) {
      event.preventDefault();
      addLineItem();
    }
    if (event.target.matches('[data-remove-line-item]')) {
      event.preventDefault();
      removeLineItem(event.target.closest('.line-item'));
    }
  });

  updateOrderTotal();
});

function addLineItem() {
  const template = document.querySelector('.line-item-template');
  if (!template) {
    return;
  }

  const clone = template.cloneNode(true);
  clone.classList.remove('d-none', 'line-item-template');
  clone.classList.add('line-item');
  clone.querySelectorAll('input, select').forEach((input) => {
    input.value = '';
  });

  const container = document.querySelector('#order-line-items');
  container.appendChild(clone);
  updateOrderTotal();
}

function removeLineItem(row) {
  if (!row) {
    return;
  }

  row.remove();
  updateOrderTotal();
}

function updateLineTotal(quantity, unitPrice) {
  return Number(quantity) * Number(unitPrice) || 0;
}

function updateOrderTotal() {
  const rows = document.querySelectorAll('.line-item');
  let total = 0;

  rows.forEach((row) => {
    const quantity = row.querySelector('[name*="Quantity"]').value;
    const price = row.querySelector('[name*="UnitPrice"]').value;
    const lineTotalField = row.querySelector('.line-total');
    const lineTotal = updateLineTotal(quantity, price);

    if (lineTotalField) {
      lineTotalField.textContent = lineTotal.toFixed(2);
    }

    total += lineTotal;
  });

  const orderTotal = document.querySelector('#order-total');
  if (orderTotal) {
    orderTotal.textContent = total.toFixed(2);
  }
}
`,
  'HON.Orders.Domain/Entities/Customer.cs': `namespace HON.Orders.Domain.Entities
{
  public class Customer : IHasSoftDelete
  {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
  }
}`,
  'HON.Orders.Domain/Entities/Order.cs': `namespace HON.Orders.Domain.Entities
{
  public class Order : IHasSoftDelete
  {
    public int Id { get; set; }
    public string OrderNumber { get; set; } = null!;
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Total { get; set; }
    public byte[] RowVersion { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    public Customer Customer { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
  }
}`,
  'HON.Orders.Domain/Entities/OrderItem.cs': `namespace HON.Orders.Domain.Entities
{
  public class OrderItem : IHasSoftDelete
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => Quantity * UnitPrice;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
  }
}`,
  'HON.Orders.Domain/Entities/Payment.cs': `namespace HON.Orders.Domain.Entities
{
  public class Payment : IHasSoftDelete
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public DateTime? PaidAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public Order Order { get; set; } = null!;
  }
}`,
  'HON.Orders.Domain/Entities/Product.cs': `namespace HON.Orders.Domain.Entities
{
  public class Product : IHasSoftDelete
  {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public string? Category { get; set; }
    public int StockQuantity { get; set; }
    public byte[] RowVersion { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
  }
}`
};

function applyHonOrdersSolutionOverlay(files, mode, assessmentKey) {
  if (assessmentKey !== 'hon-orders') {
    return files;
  }

  function getExt(path) {
    const idx = path.lastIndexOf('.');
    return idx >= 0 ? path.slice(idx).toLowerCase() : '';
  }

  function wrapAsComment(text, ext) {
    if (!text) return '';
    // Use Razor comment for .cshtml to avoid breaking razor syntax
    if (ext === '.cshtml') {
      return `@*\n${text}\n*@`;
    }
    // Use block comment for C#/JS/JSON/XML-like files
    return `/*\n${text}\n*/`;
  }

  function extractTodoLines(origContent) {
    if (!origContent) return null;
    const lines = origContent.split(/\r?\n/).map(l => l.trim());
    const todos = lines.filter(l => /TODO/i.test(l));
    if (!todos.length) return null;
    return todos.map(l => l.replace(/^\/\/?\s?/, '')).join('\n');
  }

  return files.map((file) => {
    const solutionBlock = honOrdersSolutionBlocks[file.path];
    if (!solutionBlock) {
      return file;
    }

    // Extract TODO/task lines from the original file content and prepend as comment
    const origContent = file.content || '';
    const todoText = extractTodoLines(origContent);
    const ext = getExt(file.path);
    const comment = todoText ? wrapAsComment(`TASKS:\n${todoText}`, ext) + '\n\n' : '';

    return {
      ...file,
      content: comment + solutionBlock
    };
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkTextFiles(rootDir, currentDir = rootDir, results = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (skipFolders.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkTextFiles(rootDir, entryPath, results);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await fs.readFile(entryPath, 'utf8');
    const relativePath = toPosix(path.relative(rootDir, entryPath));
    results.push({
      id: relativePath,
      name: entry.name,
      path: relativePath,
      readOnly: false,
      content
    });
  }

  return results;
}

function cloneFiles(files) {
  return files.map((file) => ({ ...file }));
}

function isRelevantScaffoldFile(file) {
  const filePath = (file?.path || '').toLowerCase();
  if (!filePath) {
    return false;
  }

  if (filePath.startsWith('hon.academy.web/wwwroot/') || filePath.includes('/wwwroot/lib/') || filePath.includes('/node_modules/')) {
    return false;
  }

  return filePath.endsWith('.cs') || filePath.endsWith('.cshtml') || filePath.endsWith('.razor');
}

function hasStarterScaffolding(files) {
  return files.some((file) => {
    if (!isRelevantScaffoldFile(file)) {
      return false;
    }

    const content = typeof file?.content === 'string' ? file.content : '';
    return content.includes('TODO') || content.includes('NotImplementedException') || content.includes('throw new NotImplementedException()');
  });
}

async function ensureProjectRoot(projectRoot, label) {
  if (!(await fileExists(projectRoot))) {
    throw new Error(`Could not find ${label} workspace at ${projectRoot}`);
  }
}

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (skipFolders.has(entry.name)) {
      continue;
    }

    const sourceEntry = path.join(source, entry.name);
    const targetEntry = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourceEntry, targetEntry);
      continue;
    }

    await fs.copyFile(sourceEntry, targetEntry);
  }
}

async function writeSnapshotFiles(tempProjectRoot, files) {
  for (const file of files || []) {
    if (!file?.path || typeof file.content !== 'string') {
      continue;
    }

    const targetPath = path.join(tempProjectRoot, file.path);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, file.content, 'utf8');
  }
}

async function unzipArchive(zipPath, destinationDir) {
  await new Promise((resolve, reject) => {
    const unzip = spawn('unzip', ['-q', zipPath, '-d', destinationDir], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    unzip.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    unzip.on('error', reject);
    unzip.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `unzip exited with code ${code}`));
    });
  });
}

async function findSolutionRoot(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.sln')) {
      return rootDir;
    }
    if (entry.isDirectory()) {
      const nested = await findSolutionRoot(entryPath).catch(() => null);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

async function findSolutionFile(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.sln')) {
      return entry.name;
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const nested = await findSolutionFile(path.join(rootDir, entry.name)).catch(() => null);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function runDotnetCommand(cwd, mode) {
  const command = mode === 'test'
    ? ['test', 'HON.Academy.sln', '-v', 'normal', '--logger', 'console;verbosity=normal']
    : ['build', 'HON.Academy.sln'];
  const result = await runCommand('dotnet', command, cwd);
  return { command, result };
}

function stripDotnetWarnings(output) {
  return output
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      return !/\bwarning\b/i.test(trimmed) && !/NU\d{4}/i.test(trimmed);
    })
    .join('\n');
}

function formatDotnetResult(result, command, mode) {
  let output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();

  if (result.code === 0) {
    const filteredOutput = stripDotnetWarnings(output);
    output = filteredOutput.trim();
  }

  return output || [
    `dotnet ${command.join(' ')}`,
    result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
    'No console output was produced by dotnet.'
  ].join('\n');
}

async function createProjectWorkspace(files = [], templateRoot) {
  await ensureProjectRoot(templateRoot, 'project');
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-dotnet-'));
  const projectName = path.basename(templateRoot);
  const projectRoot = path.join(tempRoot, projectName);
  await copyDirectory(templateRoot, projectRoot);
  await writeSnapshotFiles(projectRoot, files);
  return { tempRoot, projectRoot };
}

async function getAssessmentExecutionConfig(assessmentKey, workspaceMode = 'starter') {
  const data = await loadAssessmentData();
  const codeEditorConfig = normalizeCodeEditorConfig(data);
  const assessmentConfig = resolveAssessmentConfig(codeEditorConfig, assessmentKey);

  if (!assessmentConfig) {
    throw new Error('No code is configured for the selected assessment.');
  }

  const starterRootName = assessmentConfig.starterRoot || assessmentConfig.solutionRoot;
  const solutionRootName = assessmentConfig.solutionRoot || assessmentConfig.starterRoot;
  const selectedRootName = workspaceMode === 'solution' ? solutionRootName : starterRootName;
  
  const solutionFile = resolveAssessmentSolutionFile(assessmentConfig)
    || assessmentConfig.solutionFile
    || await findSolutionFile(path.join(workspaceRoot, starterRootName)).catch(() => null)
    || await findSolutionFile(path.join(workspaceRoot, solutionRootName)).catch(() => null)
    || '';

  if (!starterRootName || !solutionRootName || !solutionFile) {
    throw new Error(`Assessment configuration is incomplete for ${assessmentConfig.label || assessmentConfig.key}.`);
  }

  return {
    assessmentConfig,
    starterRoot: path.join(workspaceRoot, starterRootName),
    solutionRoot: path.join(workspaceRoot, solutionRootName),
    projectRoot: path.join(workspaceRoot, selectedRootName),
    solutionFile
  };
}

async function evaluateProjectBuildAndTest(files, assessmentKey, workspaceMode = 'starter') {
  const { projectRoot, solutionFile } = await getAssessmentExecutionConfig(assessmentKey, workspaceMode);
  const { tempRoot, projectRoot: tempProjectRoot } = await createProjectWorkspace(files, projectRoot);
  try {
    const buildCommand = ['build', solutionFile];
    const buildResult = await runCommand('dotnet', buildCommand, tempProjectRoot);
    const buildOutput = formatDotnetResult(buildResult, buildCommand, 'build');

    if (buildResult.code !== 0) {
      return {
        success: false,
        exitCode: buildResult.code,
        output: buildOutput,
        buildResult: {
          success: false,
          exitCode: buildResult.code,
          output: buildOutput
        },
        testResult: null,
        workspaceRoot: tempProjectRoot
      };
    }

    const testCommand = ['test', solutionFile, '-v', 'normal', '--logger', 'console;verbosity=normal'];
    const testResult = await runCommand('dotnet', testCommand, tempProjectRoot);
    const testOutput = formatDotnetResult(testResult, testCommand, 'test');

    return {
      success: testResult.code === 0,
      exitCode: testResult.code,
      output: [buildOutput, testOutput].filter(Boolean).join('\n\n'),
      buildResult: {
        success: true,
        exitCode: buildResult.code,
        output: buildOutput
      },
      testResult: {
        success: testResult.code === 0,
        exitCode: testResult.code,
        output: testOutput
      },
      workspaceRoot: tempProjectRoot
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  return body ? JSON.parse(body) : {};
}

async function loadAssessmentData() {
  const raw = await fs.readFile(assessmentDataPath, 'utf8');
  return JSON.parse(raw);
}

async function loadWorkspaceFiles(assessmentKey, mode = 'starter') {
  const data = await loadAssessmentData();
  const codeEditorConfig = normalizeCodeEditorConfig(data);
  const assessmentConfig = resolveAssessmentConfig(codeEditorConfig, assessmentKey);
  const rootName = resolveAssessmentRoot(assessmentConfig, mode);

  if (!assessmentConfig || !rootName) {
    throw new Error('No code is configured for the selected assessment.');
  }

  const projectRoot = path.join(workspaceRoot, rootName);
  await ensureProjectRoot(projectRoot, assessmentConfig.label || 'selected assessment');

  const files = await walkTextFiles(projectRoot);
  if (!files.length) {
    throw new Error(`No code files were found for ${assessmentConfig.label || 'the selected assessment'}.`);
  }

  return cloneFiles(applyHonOrdersSolutionOverlay(files, mode, assessmentConfig.key));
}

async function loadSolutionFiles(assessmentKey) {
  return loadWorkspaceFiles(assessmentKey, 'solution');
}

function parseTestOutput(output) {
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: null
  };
  const testCases = [];
  let currentFailedTest = null;

  for (const line of lines) {
    const resultMatch = line.match(/^(Passed|Failed|Skipped)\s+(.+?)\s+\[(.+?)\]$/);
    if (resultMatch) {
      const [, status, fullName, duration] = resultMatch;
      const testCase = {
        name: fullName.trim(),
        status: status.toLowerCase(),
        duration: duration.trim(),
        failureMessage: ''
      };
      testCases.push(testCase);
      if (status === 'Passed') summary.passed += 1;
      if (status === 'Failed') {
        summary.failed += 1;
        currentFailedTest = testCase;
      }
      if (status === 'Skipped') summary.skipped += 1;
      continue;
    }

    const totalMatch = line.match(/^(Total tests|Total):\s*(\d+)/i);
    if (totalMatch && !summary.total) {
      summary.total = Number(totalMatch[2]);
      continue;
    }

    const passedMatch = line.match(/^Passed:\s*(\d+)/i);
    if (passedMatch) {
      summary.passed = Number(passedMatch[1]);
      continue;
    }

    const failedMatch = line.match(/^(Failed|Failures?):\s*(\d+)/i);
    if (failedMatch) {
      summary.failed = Number(failedMatch[2]);
      continue;
    }

    const skippedMatch = line.match(/^Skipped:\s*(\d+)/i);
    if (skippedMatch) {
      summary.skipped = Number(skippedMatch[1]);
      continue;
    }

    const durationMatch = line.match(/^(Total time|duration):\s*(.+)$/i);
    if (durationMatch) {
      summary.duration = durationMatch[2].trim();
      continue;
    }

    if (currentFailedTest && !line.startsWith('xUnit.net') && !line.startsWith('A total of') && !line.startsWith('Test Run') && !/^(Total tests|Passed|Failed|Skipped|Total time|duration):/i.test(line)) {
      currentFailedTest.failureMessage += `${line}\n`;
    }
  }

  if (!summary.total && summary.passed + summary.failed + summary.skipped) {
    summary.total = summary.passed + summary.failed + summary.skipped;
  }

  return { summary, testCases };
}

async function evaluateProject(files, evalMode, assessmentKey, workspaceMode = 'starter') {
  const { projectRoot, solutionFile } = await getAssessmentExecutionConfig(assessmentKey, workspaceMode);
  const { tempRoot, projectRoot: tempProjectRoot } = await createProjectWorkspace(files, projectRoot);
  try {
    const command = evalMode === 'test'
      ? ['test', solutionFile, '-v', 'normal', '--logger', 'console;verbosity=normal']
      : ['build', solutionFile];
    const result = await runCommand('dotnet', command, tempProjectRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const finalOutput = output || [
      `dotnet ${command.join(' ')}`,
      result.code === 0 ? `${evalMode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${evalMode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
      'No console output was produced by dotnet.'
    ].join('\n');
    const response = {
      success: result.code === 0,
      exitCode: result.code,
      output: finalOutput,
      workspaceRoot: tempProjectRoot
    };

    if (evalMode === 'test') {
      const { summary, testCases } = parseTestOutput(finalOutput);
      response.testSummary = summary;
      response.testCases = testCases;
    }

    return response;
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function evaluateZip(zipBase64, mode) {
  if (!zipBase64) {
    throw new Error('Missing zip payload.');
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'devskills-zip-'));
  const zipPath = path.join(tempRoot, 'submission.zip');
  const extractRoot = path.join(tempRoot, 'extract');
  await fs.mkdir(extractRoot, { recursive: true });
  await fs.writeFile(zipPath, Buffer.from(zipBase64, 'base64'));
  await unzipArchive(zipPath, extractRoot);

  const solutionRoot = (await findSolutionRoot(extractRoot)) || extractRoot;
  try {
    let command;
    if (mode === 'test') {
      // Run tests on the specific test project
      command = ['test', 'HON.Academy.XunitTests/HON.Academy.XunitTests.csproj', '--verbosity', 'normal'];
    } else {
      command = ['build'];
    }
    const result = await runCommand('dotnet', command, solutionRoot);
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const finalOutput = output || [
      `dotnet ${command.join(' ')}`,
      result.code === 0 ? `${mode === 'test' ? 'Test run completed successfully.' : 'Build completed successfully.'}` : `${mode === 'test' ? 'Test run failed.' : 'Build failed.'}`,
      'No console output was produced by dotnet.'
    ].join('\n');

    const response = {
      success: result.code === 0,
      exitCode: result.code,
      output: finalOutput,
      workspaceRoot: solutionRoot
    };

    if (mode === 'test') {
      const { summary, testCases } = parseTestOutput(finalOutput);
      response.testSummary = summary;
      response.testCases = testCases;
    }

    return response;
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace') {
      const assessmentKey = url.searchParams.get('assessment') || url.searchParams.get('assessmentKey');
      const mode = url.searchParams.get('mode') === 'solution' ? 'solution' : 'starter';
      const files = await loadWorkspaceFiles(assessmentKey, mode);
      jsonResponse(res, 200, { files });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace/solution') {
      const assessmentKey = url.searchParams.get('assessment') || url.searchParams.get('assessmentKey');
      const files = await loadSolutionFiles(assessmentKey);
      jsonResponse(res, 200, { files });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/assessment/meta') {
      const data = await loadAssessmentData();
      jsonResponse(res, 200, data);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/run') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'build', body.assessmentKey, body.mode);
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/tests') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'test', body.assessmentKey, body.mode);
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/build-and-test') {
      const body = await readJsonBody(req);
      const result = await evaluateProjectBuildAndTest(body.files || [], body.assessmentKey, body.mode);
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/project/submit') {
      const body = await readJsonBody(req);
      const result = await evaluateProject(body.files || [], 'test', body.assessmentKey, body.mode);
      jsonResponse(res, 200, {
        ...result,
        status: result.success ? 'Submitted' : 'Blocked'
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assessment/build') {
      const body = await readJsonBody(req);
      const result = await evaluateZip(body.zipBase64, 'build');
      jsonResponse(res, 200, result);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/assessment/tests') {
      const body = await readJsonBody(req);
      const result = await evaluateZip(body.zipBase64, 'test');
      jsonResponse(res, 200, result);
      return;
    }

    jsonResponse(res, 404, { error: 'Not found' });
  } catch (error) {
    jsonResponse(res, 500, { error: error?.message || 'Unexpected server error' });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`DevSkills backend listening on http://${host}:${port}\n`);
});
