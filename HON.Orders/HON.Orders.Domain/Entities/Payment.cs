namespace HON.Orders.Domain.Entities
{
  public class Payment : IHasSoftDelete
  {
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public DateTime? PaidAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public Order Order { get; set; } = null!;
  }
}