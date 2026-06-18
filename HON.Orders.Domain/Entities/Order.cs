namespace HON.Orders.Domain.Entities;

public class Order : ISoftDelete
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = null!;
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "New";
    public decimal Total { get; set; }
    public byte[]? RowVersion { get; set; }
    public bool IsDeleted { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
    public Payment? Payment { get; set; }
}
