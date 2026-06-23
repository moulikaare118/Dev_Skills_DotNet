using Microsoft.AspNetCore.Mvc;

namespace HON.Orders.Web.Controllers
{
    /// <summary>
    /// Order controller for viewing and creating orders
    /// TODO: Implement order listing and creation
    /// </summary>
    public class OrderController : Controller
    {
        // TODO: Inject AppDbContext

        public OrderController()
        {
            // TODO: Accept DbContext in constructor
        }

        /// <summary>
        /// List customer's orders
        /// TODO: Add pagination and filtering
        /// </summary>
        [HttpGet]
        public IActionResult Index()
        {
            // TODO: Get orders from database
            // - Filter by current user (or session/cookie for demo)
            // - Order by OrderDate descending
            // - Return to view
            return View();
        }

        /// <summary>
        /// Show create order form
        /// </summary>
        [HttpGet]
        public IActionResult Create()
        {
            // TODO: Load customers for dropdown
            // TODO: Load products for line items
            // TODO: Return view with ViewModel
            return View();
        }

        /// <summary>
        /// Create new order (POST)
        /// TODO: Handle dynamic line items binding
        /// TODO: Implement validation and save
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(dynamic orderViewModel)
        {
            // TODO: Validate model
            // TODO: Create order with line items
            // TODO: Save to database
            // TODO: Implement PRG pattern (redirect to details or index)
            return RedirectToAction("Index");
        }
    }
}
