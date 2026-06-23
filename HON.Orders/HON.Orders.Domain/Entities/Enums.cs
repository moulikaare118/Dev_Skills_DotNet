namespace HON.Orders.Domain.Entities
{
    /// <summary>
    /// Order status enumeration
    /// </summary>
    public enum OrderStatus
    {
        Pending = 0,
        Confirmed = 1,
        Shipped = 2,
        Delivered = 3,
        Cancelled = 4
    }

    /// <summary>
    /// Payment method enumeration
    /// </summary>
    public enum PaymentMethod
    {
        CreditCard = 0,
        Debit = 1,
        Check = 2,
        Bank = 3,
        Other = 4
    }
}
