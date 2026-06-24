using HON.Orders.Domain.Entities;

namespace HON.Orders.Domain.DTOs
{
  // TODO: Define the CreateOrderViewModel used by customer order creation pages.
  public class CreateOrderViewModel
  {
    public int CustomerId { get; set; }
    public List<Customer> Customers { get; set; } = new();
    public List<Product> Products { get; set; } = new();
    public List<OrderLineItemViewModel> LineItems { get; set; } = new();
  }
}
