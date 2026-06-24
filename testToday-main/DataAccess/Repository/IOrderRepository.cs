using DataAccess.Model;
using DataAccess.ValueObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repository
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<List<Order>> GetRecentOrdersAsync(DateTime since);
        IAsyncEnumerable<Order> StreamOrders(DateTime since, CancellationToken ct);
        Task<List<TopCustomerDTO>> GetTopCustomersAsync();
        Task<List<Order>> SearchOrdersAsync(string? status, DateTime? from, DateTime? to, decimal? minTotal, string? email);
    }
}
