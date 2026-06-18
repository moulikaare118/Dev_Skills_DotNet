namespace HON.Orders.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = null!;
    public DateTime PaidAt { get; set; }
}
