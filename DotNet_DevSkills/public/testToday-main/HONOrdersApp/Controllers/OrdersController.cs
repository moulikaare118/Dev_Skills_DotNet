using DataAccess.Data;
using DataAccess.Model;
using DataAccess.Repository;
using DataAccess.ValueObject;
using HONOrdersApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HONOrdersApp.Controllers
{
    public class OrdersController : Controller
    {
        private readonly IRepository<Customer> _customerRepo;
        private readonly IOrderRepository _repo;
       
        private readonly IRepository<Product> _productRepo;

        public OrdersController(IOrderRepository repo, IRepository<Customer> customerRepo, IRepository<Product> productRepo)
        {
            _repo = repo;
            _customerRepo = customerRepo;
            _productRepo = productRepo;
        }

        // GET: Orders
        public async Task<IActionResult> Index()
        {
            // TODO:
            // - Fetch all orders using repository.
            // - Map to OrderViewModel.
            // - Return View with mapped data.
            throw new NotImplementedException();
        }

        // GET: Orders/Create
        public async Task<IActionResult> Create()
        {
            // TODO:
            // - Create OrderViewModel.
            // - Load customers from repository.
            // - Populate Customers dropdown (SelectListItem).
            // - Load products from repository.
            // - Populate Products dropdown (SelectListItem).
            // -Populate other necessary fields if needed (e,g - status set in Dropdown as "Pending" / "Completed",).
            // - Return View with ViewModel.
            throw new NotImplementedException();
        }

        // POST: Orders/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(OrderViewModel vm)
        {

            // TODO:
            // - Validate ModelState.
            // - Create new Order entity.
            // - For each item:
            //      • Fetch product
            //      • Calculate line total
            //      • Add OrderItem
            // - Calculate overall order total.
            // - Add Payment entry.
            // - Save using repository.
            // - Redirect to Index on success.

            throw new NotImplementedException();
        }

        public async Task<IActionResult> TopCustomers()
        {
            // TODO:
            // - Call repository method to fetch top customers.
            // - Return View with result.
                throw new NotImplementedException();
        }

        public async Task<IActionResult> StreamDemo(CancellationToken ct)
        {
            // TODO:
            // - Use StreamOrders async stream.
            // - Count streamed records.
            // - Simulate processing delay.
            // - Return content message with total count.
                throw new NotImplementedException();
        }

        public async Task<IActionResult> Search(string? status,DateTime? from,DateTime? to,decimal? minTotal,string? email)
        {
            // TODO: Search Orders
            // - Call SearchOrdersAsync with filters.
            // - Map result to OrderViewModel.
            // - Return Index view with filtered results.

            throw new NotImplementedException();
        }

    }
}
