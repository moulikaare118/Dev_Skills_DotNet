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
            var orders = await _repo.GetAllAsync();
            var vm = orders.Select(o => new OrderViewModel
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                CustomerId = o.CustomerId,
                Status = o.Status,
                Total = o.Total
            }).ToList();

            return View(vm);
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
            var customers = await _customerRepo.GetAllAsync();
            var products = await _productRepo.GetAllAsync();

            var vm = new OrderViewModel
            {
                OrderDate = DateTime.Today,
                Status = "Pending",
                Customers = customers.Select(c => new SelectListItem(c.Name, c.Id.ToString())).ToList(),
                Products = products.Select(p => new SelectListItem($"{p.Name} ({p.Sku})", p.Id.ToString())).ToList()
            };

            return View(vm);
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
            if (!ModelState.IsValid)
            {
                vm.Customers = (await _customerRepo.GetAllAsync()).Select(c => new SelectListItem(c.Name, c.Id.ToString())).ToList();
                vm.Products = (await _productRepo.GetAllAsync()).Select(p => new SelectListItem($"{p.Name} ({p.Sku})", p.Id.ToString())).ToList();
                return View(vm);
            }

            var order = new Order
            {
                OrderNumber = vm.OrderNumber,
                OrderDate = vm.OrderDate,
                CustomerId = vm.CustomerId,
                Status = vm.Status,
                Total = 0m
            };

            foreach (var item in vm.Items)
            {
                var product = await _productRepo.GetAsync(item.ProductId);
                if (product == null)
                    continue;

                var lineTotal = product.UnitPrice * item.Quantity;
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.UnitPrice,
                    LineTotal = lineTotal
                });

                order.Total += lineTotal;
            }

            order.Payments.Add(new Payment
            {
                Amount = vm.PaymentAmount,
                Method = vm.PaymentMethod,
                PaidAt = DateTime.UtcNow
            });

            await _repo.AddAsync(order);
            await _repo.SaveAsync();

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> TopCustomers()
        {
            // TODO:
            // - Call repository method to fetch top customers.
            // - Return View with result.
                var topCustomers = await _repo.GetTopCustomersAsync();
                return View(topCustomers);
        }

        public async Task<IActionResult> StreamDemo(CancellationToken ct)
        {
            // TODO:
            // - Use StreamOrders async stream.
            // - Count streamed records.
            // - Simulate processing delay.
            // - Return content message with total count.
                var count = 0;
                await foreach (var order in _repo.StreamOrders(DateTime.UtcNow.AddDays(-30), ct))
                {
                    await Task.Delay(50, ct);
                    count++;
                }

                return Content($"Streamed {count} orders.");
        }

        public async Task<IActionResult> Search(string? status,DateTime? from,DateTime? to,decimal? minTotal,string? email)
        {
            // TODO: Search Orders
            // - Call SearchOrdersAsync with filters.
            // - Map result to OrderViewModel.
            // - Return Index view with filtered results.

            var orders = await _repo.SearchOrdersAsync(status, from, to, minTotal, email);
            var vm = orders.Select(o => new OrderViewModel
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                CustomerId = o.CustomerId,
                Status = o.Status,
                Total = o.Total
            }).ToList();

            return View("Index", vm);
        }

    }
}
