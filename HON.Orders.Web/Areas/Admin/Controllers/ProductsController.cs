using HON.Orders.Data;
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
}
