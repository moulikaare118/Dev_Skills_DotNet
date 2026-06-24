namespace HON.Orders.Tests
{
  public class MoneyTests
  {
    [Fact]
    public void Constructor_WithValidAmount_CreatesInstance()
    {
      var money = new Money(99.99m, "USD");
      Assert.Equal(99.99m, money.Amount);
      Assert.Equal("USD", money.Currency);
    }

    [Fact]
    public void Constructor_WithNegativeAmount_ThrowsArgumentException()
    {
      Assert.Throws<ArgumentException>(() => new Money(-10m, "USD"));
    }

    [Theory]
    [InlineData(10, 5, 15)]
    [InlineData(100, 25, 125)]
    public void Addition_TwoMoneyObjects_ReturnsSumWithCorrectCurrency(
      decimal amt1, decimal amt2, decimal expected)
    {
      var money1 = new Money(amt1, "USD");
      var money2 = new Money(amt2, "USD");
      var result = money1 + money2;
      Assert.Equal(expected, result.Amount);
      Assert.Equal("USD", result.Currency);
    }
  }
}