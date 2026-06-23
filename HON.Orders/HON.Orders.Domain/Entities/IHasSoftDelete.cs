namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// Interface for entities that support soft delete
    /// </summary>
    public interface IHasSoftDelete
    {
        bool IsDeleted { get; set; }
    }
}
