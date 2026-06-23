using HON.Orders.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace HON.Orders.Web.Areas.Admin.Controllers
{
    /// <summary>
    /// Admin Product Controller for CRUD operations
    /// TODO: Apply [AdminRoleCheck] filter
    /// TODO: Implement all CRUD actions with validation, antiforgery, TempData
    /// </summary>
    [Area("Admin")]
    // TODO: [AdminRoleCheck]
    public class ProductController : Controller
    {
        // TODO: Inject AppDbContext

        public ProductController()
        {
            // TODO: Accept DbContext in constructor
        }

        /// <summary>
        /// List all products (including soft-deleted for admin)
        /// TODO: Add pagination and search
        /// </summary>
        [HttpGet]
        public IActionResult Index(int page = 1)
        {
            // TODO: Get products from database
            // TODO: Use IncludeDeleted() to show all records
            // TODO: Add pagination (20 per page)
            // TODO: Return to view
            return View();
        }

        /// <summary>
        /// Show create product form
        /// </summary>
        [HttpGet]
        public IActionResult Create()
        {
            return View(new ProductViewModel());
        }

        /// <summary>
        /// Create new product (POST)
        /// TODO: Implement validation, antiforgery, TempData, PRG pattern
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(ProductViewModel model)
        {
            // TODO: Validate model
            // TODO: Create Product entity from ViewModel
            // TODO: Save to database
            // TODO: Set TempData success message
            // TODO: Redirect to Index (PRG pattern)
            return RedirectToAction(nameof(Index));
        }

        /// <summary>
        /// Show edit product form
        /// </summary>
        [HttpGet]
        public IActionResult Edit(int id)
        {
            // TODO: Get product by ID
            // TODO: Map to ViewModel
            // TODO: Return to view or 404
            return View();
        }

        /// <summary>
        /// Update product (POST)
        /// TODO: Handle concurrency conflicts (RowVersion)
        /// TODO: Implement TempData success/error messages
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, ProductViewModel model)
        {
            // TODO: Validate model
            // TODO: Get product from database
            // TODO: Update properties
            // TODO: Handle DbUpdateConcurrencyException
            // TODO: Save changes
            // TODO: Set TempData message
            // TODO: Redirect to Index (PRG pattern)
            return RedirectToAction(nameof(Index));
        }

        /// <summary>
        /// Show delete confirmation
        /// </summary>
        [HttpGet]
        public IActionResult Delete(int id)
        {
            // TODO: Get product by ID
            // TODO: Return confirmation view
            return View();
        }

        /// <summary>
        /// Delete product (soft delete)
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            // TODO: Get product by ID
            // TODO: Set IsDeleted = true
            // TODO: Save changes
            // TODO: Set TempData message
            // TODO: Redirect to Index (PRG pattern)
            return RedirectToAction(nameof(Index));
        }
    }
}
