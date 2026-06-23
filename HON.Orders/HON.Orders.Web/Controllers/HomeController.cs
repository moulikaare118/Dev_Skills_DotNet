using Microsoft.AspNetCore.Mvc;

namespace HON.Orders.Web.Controllers
{
    /// <summary>
    /// Home controller
    /// TODO: Create dashboard view with summary cards and recent orders
    /// </summary>
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            // TODO: Get dashboard data
            // - Get order statistics
            // - Get recent orders
            // - Pass to view
            return View();
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
