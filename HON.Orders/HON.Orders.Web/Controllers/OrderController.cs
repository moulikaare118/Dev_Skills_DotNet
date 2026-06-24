using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using HON.Orders.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers
{
  // TODO: Implement customer-facing order creation, validation, and dynamic line items.
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
    // TODO: Prepare the order creation form with customers, products, and one empty line item.
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

      // TODO: Use PRG pattern and TempData notifications for successful order creation.
      TempData["Success"] = "Order created successfully.";
      return RedirectToAction(nameof(Index));
    }
  }
}
