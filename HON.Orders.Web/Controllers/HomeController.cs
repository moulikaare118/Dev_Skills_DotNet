using System.Diagnostics;
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
}
