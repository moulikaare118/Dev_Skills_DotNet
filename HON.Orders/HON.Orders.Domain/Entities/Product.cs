namespace HON.Orders.Domain.Entities
{
  public class Product : IHasSoftDelete
  {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public string? Category { get; set; }
    public int StockQuantity { get; set; }
    public byte[] RowVersion { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
  }
}