namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// Order entity
    /// TODO: Add concurrency control with RowVersion
    /// TODO: Implement IHasSoftDelete interface
    /// </summary>
    public class Order : IHasSoftDelete
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public int CustomerId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal Total { get; set; }
        public byte[]? RowVersion { get; set; }
        public bool IsDeleted { get; set; }

        // Shadow properties (managed by EF Core):
        // public DateTime CreatedAt { get; set; }
        // public DateTime LastModifiedAt { get; set; }

        // Navigation properties
        public Customer Customer { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
