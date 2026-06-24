using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.ValueObject
{
    public sealed class Money : IEquatable<Money>
    {
        public decimal Amount { get; }
        public string Currency { get; }

        public Money(decimal amount, string currency = "INR")
        {
            // ============================================================
            // Task – Constructor Validation
            // ============================================================
            // TODO:
            // - Accept amount and optional currency (default = "INR")
            // - Currency must be exactly 3 characters (ISO format).
            // - Throw ArgumentException if invalid.
            // - Store currency in uppercase.
            // - Amount should be immutable.

            if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3)
                throw new ArgumentException("Currency must be a 3-letter ISO code.", nameof(currency));

            Amount = amount;
            Currency = currency.ToUpperInvariant();
        }

        // Formatting
        public override string ToString()
        {
            // TODO:
            // - Return formatted string in the format:
            //      "INR 1,234.00"
            // - Currency first, followed by space.
            // - Amount formatted with 2 decimal places
            return $"{Currency} {Amount:N2}";
        }

        // Arithmetic Operators
        public static Money operator +(Money a, Money b)
        {
            // TODO:
            // - Add two Money objects.
            // - Ensure both have same currency.
            // - Return new Money instance.
            EnsureSameCurrency(a,b);
            return new Money(a.Amount + b.Amount, a.Currency);

        }

        public static Money operator -(Money a, Money b)
        {
            // TODO:
            // - Subtract two Money objects.
            // - Ensure both have same currency.
            EnsureSameCurrency(a,b);
            return new Money(a.Amount - b.Amount, a.Currency);
        }

        public static Money operator *(Money a, int qty)
        {
            // TODO:
            // - Multiply Money by integer quantity.
            // - Return new Money instance.
            return new Money(a.Amount * qty, a.Currency);
        }

        // Task – Currency Validation
        private static void EnsureSameCurrency(Money a, Money b)
        {
            // TODO:
            // - Throw InvalidOperationException if currencies do not match.
            if (a == null || b == null)
                throw new InvalidOperationException("Cannot compare currency with null Money instance.");

            if (!string.Equals(a.Currency, b.Currency, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Currencies must match to perform arithmetic operations.");
        }

        public bool Equals(Money? other)
        {
            // TODO:
            // - Two Money objects are equal if:
            //      Amount is equal AND Currency is equal.
            // - Implement IEquatable<Money>.
            if (other is null)
                return false;

            return Amount == other.Amount && string.Equals(Currency, other.Currency, StringComparison.OrdinalIgnoreCase);
        }
        public override int GetHashCode()
        {
            // TODO:
            // - Override GetHashCode using Amount and Currency.
            return HashCode.Combine(Amount, Currency?.ToUpperInvariant());
        }
    }

    public static class MoneyExtensions
    {
        // TODO:
        // - Convert decimal to formatted Money string.
        // - Use Money class internally.
        // - Default currency = "INR".
        public static string FormatMoney(this decimal value, string currency = "INR")
        {
            return new Money(value, currency).ToString();
        }
    }
}

