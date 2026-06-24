namespace HON.Orders.Domain.Entities
{
  public class Customer : IHasSoftDelete
  {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
  }
}