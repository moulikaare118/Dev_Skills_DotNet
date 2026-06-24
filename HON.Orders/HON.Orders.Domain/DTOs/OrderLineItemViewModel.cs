namespace HON.Orders.Domain.DTOs
{
  // TODO: Define an order line item view model for dynamic order entry and validation.
  public class OrderLineItemViewModel
  {
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
  }
}
