using HON.Orders.Domain.ValueObjects;

namespace HON.Orders.Tests
{
    /// <summary>
    /// Unit tests for Money value object
    /// TODO: Implement all test methods
    /// </summary>
    public class MoneyTests
    {
        [Fact]
        public void Constructor_WithValidAmount_CreatesInstance()
        {
            // TODO: Arrange & Act
            // var money = new Money(99.99m, "USD");

            // TODO: Assert
            // Assert.Equal(99.99m, money.Amount);
            // Assert.Equal("USD", money.Currency);
        }

        [Fact]
        public void Constructor_WithNegativeAmount_ThrowsArgumentException()
        {
            // TODO: Act & Assert
            // Assert.Throws<ArgumentException>(() => new Money(-10m, "USD"));
        }

        [Theory]
        [InlineData(10, 5, 15)]
        [InlineData(100, 25, 125)]
        public void Addition_TwoMoneyObjects_ReturnsSumWithCorrectCurrency(
            decimal amt1, decimal amt2, decimal expected)
        {
            // TODO: Arrange
            // var money1 = new Money(amt1, "USD");
            // var money2 = new Money(amt2, "USD");

            // TODO: Act
            // var result = money1 + money2;

            // TODO: Assert
            // Assert.Equal(expected, result.Amount);
            // Assert.Equal("USD", result.Currency);
        }

        [Fact]
        public void ToString_ReturnsFormattedString()
        {
            // TODO: Arrange & Act
            // var money = new Money(99.99m, "USD");
            // var result = money.ToString();

            // TODO: Assert
            // Assert.Equal("USD 99.99", result);
        }
    }
}
