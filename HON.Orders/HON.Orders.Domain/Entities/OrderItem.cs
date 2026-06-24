namespace HON.Orders.Domain.Entities
{
  public class OrderItem : IHasSoftDelete
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => Quantity * UnitPrice;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
  }
}