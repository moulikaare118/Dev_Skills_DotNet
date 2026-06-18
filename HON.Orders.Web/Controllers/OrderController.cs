using HON.Orders.Data;
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
}
