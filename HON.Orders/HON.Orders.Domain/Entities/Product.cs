namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// Product entity
    /// TODO: Add concurrency control with RowVersion
    /// TODO: Implement IHasSoftDelete interface
    /// </summary>
    public class Product : IHasSoftDelete
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public decimal UnitPrice { get; set; }
        public string? Category { get; set; }
        public int StockQuantity { get; set; }
        public byte[]? RowVersion { get; set; }
        public bool IsDeleted { get; set; }

        // Shadow properties (managed by EF Core):
        // public DateTime CreatedAt { get; set; }
        // public DateTime LastModifiedAt { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
