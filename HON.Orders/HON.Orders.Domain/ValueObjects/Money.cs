namespace HON.Orders.Domain.ValueObjects
{
  // TODO: Ensure Money is immutable, supports formatting, arithmetic operators,
  // and that the decimal extension FormatMoney delegates to Money formatting.
  public class Money : IEquatable<Money>
  {
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "USD")
    {
      if (amount < 0)
        throw new ArgumentException("Amount cannot be negative", nameof(amount));
      Amount = amount;
      Currency = currency;
    }

      public override string ToString() => $"{Currency} {Amount:F2}";

    public static Money operator +(Money left, Money right)
    {
      if (left.Currency != right.Currency)
        throw new InvalidOperationException("Cannot add money with different currencies");
      return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
      if (left.Currency != right.Currency)
        throw new InvalidOperationException("Cannot subtract money with different currencies");
      return new Money(left.Amount - right.Amount, left.Currency);
    }

    public static Money operator *(Money money, decimal multiplier)
      => new Money(money.Amount * multiplier, money.Currency);

    public bool Equals(Money other)
      => other != null && Amount == other.Amount && Currency == other.Currency;

    public override bool Equals(object obj)
      => Equals(obj as Money);

    public override int GetHashCode()
      => HashCode.Combine(Amount, Currency);
  }

  public static class DecimalExtensions
  {
    public static string FormatMoney(this decimal amount, string currency = "USD")
      => new Money(amount, currency).ToString();
  }
}