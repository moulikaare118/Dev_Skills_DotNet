namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// OrderItem entity (line item in an order)
    /// TODO: Implement IHasSoftDelete interface
    /// </summary>
    public class OrderItem : IHasSoftDelete
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal => Quantity * UnitPrice;
        public bool IsDeleted { get; set; }

        // Shadow properties (managed by EF Core):
        // public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Order Order { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
