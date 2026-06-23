using Microsoft.AspNetCore.Mvc;

namespace HON.Orders.Web.Controllers
{
    /// <summary>
    /// Catalog controller for browsing products
    /// TODO: Implement product listing and details
    /// </summary>
    public class CatalogController : Controller
    {
        // TODO: Inject AppDbContext

        public CatalogController()
        {
            // TODO: Accept DbContext in constructor
        }

        /// <summary>
        /// List all products with pagination
        /// TODO: Add pagination, search, category filter
        /// </summary>
        [HttpGet]
        public IActionResult Index(int page = 1)
        {
            // TODO: Get products from database
            // - Implement pagination (20 per page)
            // - Optional: add category filter
            // - Return to view
            return View();
        }

        /// <summary>
        /// Show product details
        /// </summary>
        [HttpGet]
        public IActionResult Details(int id)
        {
            // TODO: Get product by ID
            // - Return 404 if not found
            // - Return to view
            return View();
        }
    }
}
