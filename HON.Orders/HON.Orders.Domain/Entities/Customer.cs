namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// Customer entity
    /// TODO: Implement IHasSoftDelete interface
    /// </summary>
    public class Customer : IHasSoftDelete
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool IsDeleted { get; set; }

        // Shadow properties (managed by EF Core):
        // public DateTime CreatedAt { get; set; }
        // public DateTime LastModifiedAt { get; set; }

        // Navigation properties
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
