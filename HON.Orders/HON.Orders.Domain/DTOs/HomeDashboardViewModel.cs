namespace HON.Orders.Domain.DTOs
{
  // TODO: Define dashboard model for metrics and recent orders displayed on home page.
  public class HomeDashboardViewModel
  {
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<OrderSummaryDto> RecentOrders { get; set; } = new();
  }

  public class OrderSummaryDto
  {
    public string OrderNumber { get; set; } = null!;
    public string CustomerName { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = null!;
  }
}
