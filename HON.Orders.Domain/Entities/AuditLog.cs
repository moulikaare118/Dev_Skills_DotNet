namespace HON.Orders.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public string EntityName { get; set; } = null!;
    public string EntityId { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string Username { get; set; } = null!;
    public DateTime OccurredAt { get; set; }
    public string Details { get; set; } = null!;
}
