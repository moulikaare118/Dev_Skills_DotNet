namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// Payment entity
    /// TODO: Implement IHasSoftDelete interface
    /// </summary>
    public class Payment : IHasSoftDelete
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public DateTime? PaidAt { get; set; }
        public bool IsDeleted { get; set; }

        // Shadow properties (managed by EF Core):
        // public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Order Order { get; set; } = null!;
    }
}
