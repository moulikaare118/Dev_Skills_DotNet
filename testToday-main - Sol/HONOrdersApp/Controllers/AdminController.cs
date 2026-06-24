using DataAccess.Model;
using DataAccess.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HONOrdersApp.Controllers
{
    public class AdminController : Controller
    {
        private readonly IRepository<Product> _productRepo;

        public AdminController(IRepository<Product> productRepo)
        {
            _productRepo = productRepo;
        }

        // GET: Admin/Products
        public async Task<IActionResult> Products()
        {
            var products = await _productRepo.GetAllAsync();
            return View(products);
        }

        // GET: Admin/CreateProduct
        public IActionResult CreateProduct()
        {
            return View();
        }

        // POST: Admin/CreateProduct
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateProduct(Product product)
        {
            if (!ModelState.IsValid)
            {
                return View(product);
            }

            await _productRepo.AddAsync(product);
            await _productRepo.SaveAsync();

            TempData["SuccessMessage"] = $"Product '{product.Name}' created successfully.";
            return RedirectToAction(nameof(Products));
        }

        // GET: Admin/EditProduct/5
        public async Task<IActionResult> EditProduct(int? id)
        {
            if (!id.HasValue)
                return NotFound();

            var product = await _productRepo.GetAsync(id.Value);
            if (product == null)
                return NotFound();

            return View(product);
        }

        // POST: Admin/EditProduct/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditProduct(int id, Product product)
        {
            if (id != product.Id)
                return NotFound();

            if (!ModelState.IsValid)
            {
                return View(product);
            }

            var existingProduct = await _productRepo.GetAsync(id);
            if (existingProduct == null)
                return NotFound();

            existingProduct.Name = product.Name;
            existingProduct.Sku = product.Sku;
            existingProduct.Category = product.Category;
            existingProduct.UnitPrice = product.UnitPrice;
            existingProduct.StockQuantity = product.StockQuantity;

            await _productRepo.SaveAsync();

            TempData["SuccessMessage"] = $"Product '{product.Name}' updated successfully.";
            return RedirectToAction(nameof(Products));
        }

        // GET: Admin/DeleteProduct/5
        public async Task<IActionResult> DeleteProduct(int? id)
        {
            if (!id.HasValue)
                return NotFound();

            var product = await _productRepo.GetAsync(id.Value);
            if (product == null)
                return NotFound();

            return View(product);
        }

        // POST: Admin/DeleteProduct/5
        [HttpPost]
        [ActionName("DeleteProduct")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteProductConfirmed(int id)
        {
            var product = await _productRepo.GetAsync(id);
            if (product == null)
                return NotFound();

            // TODO: Implement delete logic
            // For now, we'll just remove the product.
            _productRepo.Remove(product);
            await _productRepo.SaveAsync();

            TempData["SuccessMessage"] = $"Product '{product.Name}' deleted successfully.";
            return RedirectToAction(nameof(Products));
        }
    }
}
