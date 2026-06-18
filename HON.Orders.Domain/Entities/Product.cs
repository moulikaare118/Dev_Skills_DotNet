namespace HON.Orders.Domain.Entities;

public class Product : ISoftDelete
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public string Category { get; set; } = null!;
    public int StockQuantity { get; set; }
    public byte[]? RowVersion { get; set; }
    public bool IsDeleted { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
}
