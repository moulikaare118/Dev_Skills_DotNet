namespace HON.Orders.Domain.ValueObjects
{
    /// <summary>
    /// Immutable Money value object
    /// TODO: Implement immutability and operators
    /// - Implement: +, -, *, /
    /// - Implement: Equals(), GetHashCode()
    /// - Implement: ToString()
    /// - Add currency validation
    /// </summary>
    public class Money
    {
        public decimal Amount { get; }
        public string Currency { get; }

        public Money(decimal amount, string currency = "USD")
        {
            // TODO: Validate amount >= 0
            Amount = amount;
            Currency = currency;
        }

        public override string ToString()
        {
            // TODO: Return formatted string like "USD 99.99"
            return $"{Currency} {Amount:F2}";
        }

        // TODO: Implement operators (+, -, *, /)
        // TODO: Implement Equals() and GetHashCode()
    }

    /// <summary>
    /// Extension methods for formatting money
    /// </summary>
    public static class DecimalExtensions
    {
        /// <summary>
        /// Formats decimal as currency using Money value object
        /// </summary>
        public static string FormatMoney(this decimal amount, string currency = "USD")
        {
            return new Money(amount, currency).ToString();
        }
    }
}
