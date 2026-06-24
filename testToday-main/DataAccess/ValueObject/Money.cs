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

            throw new NotImplementedException();
        }

        // Formatting
        public override string ToString()
        {
            // TODO:
            // - Return formatted string in the format:
            //      "INR 1,234.00"
            // - Currency first, followed by space.
            // - Amount formatted with 2 decimal places
            throw new NotImplementedException();
        }

        // Arithmetic Operators
        public static Money operator +(Money a, Money b)
        {
            // TODO:
            // - Add two Money objects.
            // - Ensure both have same currency.
            // - Return new Money instance.
            EnsureSameCurrency(a,b);
            throw new NotImplementedException();

        }

        public static Money operator -(Money a, Money b)
        {
            // TODO:
            // - Subtract two Money objects.
            // - Ensure both have same currency.
            throw new NotImplementedException();
        }

        public static Money operator *(Money a, int qty)
        {
            // TODO:
            // - Multiply Money by integer quantity.
            // - Return new Money instance.
            throw new NotImplementedException();
        }

        // Task – Currency Validation
        private static void EnsureSameCurrency(Money a, Money b)
        {
            // TODO:
            // - Throw InvalidOperationException if currencies do not match.
            throw new NotImplementedException();
        }

        public bool Equals(Money? other)
        {
            // TODO:
            // - Two Money objects are equal if:
            //      Amount is equal AND Currency is equal.
            // - Implement IEquatable<Money>.
            throw new NotImplementedException();
        }
        public override int GetHashCode()
        {
            // TODO:
            // - Override GetHashCode using Amount and Currency.
            throw new NotImplementedException();
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
            throw new NotImplementedException();
        }
    }
}
