namespace HON.Orders.Domain.Entities;

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
}
