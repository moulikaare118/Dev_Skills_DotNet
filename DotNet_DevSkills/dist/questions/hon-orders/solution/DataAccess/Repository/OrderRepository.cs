using DataAccess.Data;
using DataAccess.Helper;
using DataAccess.Model;
using DataAccess.ValueObject;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repository
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(HONOrdersDbContex context) : base(context) { }

        //Task 1.1 Get Recent Orders
        public async Task<List<Order>> GetRecentOrdersAsync(DateTime since)
        {
            // TODO:
            // - Return all orders placed on or after the given "since" date.
            // - Use EF Core async query.
            // - Results should be returned as a List<Order>.
            return await _context.Orders
                .Where(o => o.OrderDate >= since)
                .ToListAsync();
        }

        //  Task 1.3 Async Stream
        public async IAsyncEnumerable<Order> StreamOrders(DateTime since,
            [EnumeratorCancellation] CancellationToken ct)
        {
            // TODO:
            // - Implement async streaming of orders placed on or after "since".
            // - Use paging logic (page size = 3).
            // - Fetch data in batches using Skip() and Take().
            // - Stop when no more records exist.
            // - Respect the provided CancellationToken.
            // - Use yield return for streaming.
            const int pageSize = 3;
            var page = 0;

            while (true)
            {
                ct.ThrowIfCancellationRequested();

                var batch = await _context.Orders
                    .Where(o => o.OrderDate >= since)
                    .OrderBy(o => o.Id)
                    .Skip(page * pageSize)
                    .Take(pageSize)
                    .ToListAsync(ct);

                if (!batch.Any())
                    yield break;

                foreach (var order in batch)
                {
                    ct.ThrowIfCancellationRequested();
                    yield return order;
                }

                page++;
            }
        }


        // Task 1.2 LINQ Join + Grouping
        public async Task<List<TopCustomerDTO>> GetTopCustomersAsync()
        {
            // TODO:
            // - Return Top 5 customers in last 30 days.
            // - Calculate:
            //      CustomerName
            //      OrdersCount (distinct orders)
            //      Revenue (sum of LineTotal)
            // - Sort by Revenue descending.
            // - Use LINQ GroupBy and projection to TopCustomerDTO.
            // - Execute query asynchronously.
            var cutoff = DateTime.UtcNow.AddDays(-30);

            return await _context.Orders
                .Where(o => o.OrderDate >= cutoff)
                .Include(o => o.Customer)
                .GroupBy(o => new { o.CustomerId, o.Customer.Name })
                .Select(g => new TopCustomerDTO
                {
                    CustomerName = g.Key.Name,
                    OrdersCount = g.Select(x => x.Id).Distinct().Count(),
                    Revenue = g.Sum(x => x.Total)
                })
                .OrderByDescending(x => x.Revenue)
                .Take(5)
                .ToListAsync();
        }

        //Task 1.4 — Dynamic Predicate(Expression Trees)
        public async Task<List<Order>> SearchOrdersAsync(string? status, DateTime? from, DateTime? to, decimal? minTotal, string? email)
        {
            // TODO:
            // - Use OrderPredicateBuilder.Build(...) to generate filter expression.
            // - Include Customer navigation property.
            // - Apply dynamic filtering using Where(predicate).
            // - Execute asynchronously and return filtered list.
            var predicate = OrderPredicateBuilder.Build(status, from, to, minTotal, email);
            return await _context.Orders
                .Include(o => o.Customer)
                .Where(predicate)
                .ToListAsync();
        }
    }
}
