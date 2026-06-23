namespace HON.Orders.Domain.DTOs
{
    /// <summary>
    /// DTO for top customers by revenue
    /// </summary>
    public class TopCustomerDto
    {
        public string CustomerName { get; set; } = null!;
        public int OrdersCount { get; set; }
        public decimal Revenue { get; set; }
    }
}
