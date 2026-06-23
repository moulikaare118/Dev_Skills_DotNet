namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// AuditLog entity for tracking entity changes
    /// </summary>
    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityName { get; set; } = null!;
        public int EntityId { get; set; }
        public string Action { get; set; } = null!;
        public string Username { get; set; } = null!;
        public DateTime OccurredAt { get; set; }
        public string? Details { get; set; }
    }
}
