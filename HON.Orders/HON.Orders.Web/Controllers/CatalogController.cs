using HON.Orders.Data;
using HON.Orders.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HON.Orders.Web.Controllers
{
  // TODO: Implement catalog browsing and search UX with soft delete filtering.
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
