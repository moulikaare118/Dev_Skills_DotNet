namespace HON.Orders.Domain.Extensions;

using HON.Orders.Domain.ValueObjects;

// task1.1 - Decimal extension to convert decimals to Money objects
public static class DecimalMoneyExtensions
{
    public static Money FormatMoney(this decimal value, string currency = "USD") => new Money(value, currency);
}
