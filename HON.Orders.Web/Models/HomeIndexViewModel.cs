using HON.Orders.Domain.Entities;

namespace HON.Orders.Web.Models;

public class HomeIndexViewModel
{
    public List<TopCustomerViewModel> TopCustomers { get; set; } = new();
    public List<RecentOrderViewModel> RecentOrders { get; set; } = new();
}

public sealed class TopCustomerViewModel
{
    public string CustomerName { get; set; } = null!;
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
}

public sealed class RecentOrderViewModel
{
    public string OrderNumber { get; set; } = null!;
    public string CustomerName { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = null!;
}
