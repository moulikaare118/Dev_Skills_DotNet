using HON.Orders.Data;
using HON.Orders.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers
{
  // TODO: Build the dashboard model with summary metrics and map recent orders to DTOs.
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
