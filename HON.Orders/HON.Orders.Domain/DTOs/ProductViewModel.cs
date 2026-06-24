namespace HON.Orders.Domain.DTOs
{
  // TODO: Define the ProductViewModel used by Admin product CRUD pages.
  public class ProductViewModel
  {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public string? Category { get; set; }
    public int StockQuantity { get; set; }
  }
}
