using HON.Orders.Data;
using HON.Orders.Domain.DTOs;
using HON.Orders.Domain.Entities;
using HON.Orders.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Areas.Admin.Controllers
{
  [Area("Admin")]
  [AdminRoleCheck]
  // TODO: Admin area should support Product CRUD with antiforgery, TempData notifications,
  // soft delete, and Post/Redirect/Get to avoid duplicate form submissions.
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
