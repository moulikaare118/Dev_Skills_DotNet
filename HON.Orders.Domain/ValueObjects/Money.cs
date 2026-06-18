namespace HON.Orders.Domain.ValueObjects;

// task1.1 - Money value object with immutability, formatting, and arithmetic operators
public sealed class Money : IEquatable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "USD")
    {
        Amount = amount;
        Currency = currency;
    }

    public override string ToString() => Format();

    public string Format() => string.Format(System.Globalization.CultureInfo.InvariantCulture, "{0:C2}", Amount);

    public static Money operator +(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return new Money(left.Amount - right.Amount, left.Currency);
    }

    public static Money operator *(Money money, decimal multiplier) => new Money(money.Amount * multiplier, money.Currency);
    public static Money operator *(decimal multiplier, Money money) => money * multiplier;
    public static Money operator /(Money money, decimal divisor) => new Money(money.Amount / divisor, money.Currency);

    public static bool operator ==(Money? left, Money? right) => Equals(left, right);
    public static bool operator !=(Money? left, Money? right) => !Equals(left, right);

    public override bool Equals(object? obj) => Equals(obj as Money);

    public bool Equals(Money? other) => other is not null && Amount == other.Amount && Currency == other.Currency;

    public override int GetHashCode() => HashCode.Combine(Amount, Currency);

    private static void EnsureSameCurrency(Money left, Money right)
    {
        if (!string.Equals(left.Currency, right.Currency, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Cannot operate on Money values with different currencies.");
        }
    }
}
