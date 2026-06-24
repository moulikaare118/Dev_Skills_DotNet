using DataAccess.Validation;
using DataAccess.ValueObject;
using System.ComponentModel.DataAnnotations;
using Xunit;

namespace HONOrders.Tests
{
    public class MoneyAndValidationTests
    {
        [Fact]
        public void Money_Constructor_WithValidCurrency_SetsValues()
        {
            var money = new Money(1234.56m, "usd");

            Assert.Equal(1234.56m, money.Amount);
            Assert.Equal("USD", money.Currency);
        }

        [Theory]
        [InlineData("US")]
        [InlineData("USDT")]
        [InlineData("")]
        [InlineData(null)]
        public void Money_Constructor_InvalidCurrency_ThrowsArgumentException(string currency)
        {
            Assert.Throws<ArgumentException>(() => new Money(100m, currency));
        }

        [Fact]
        public void Money_ToString_UsesCurrencyAndTwoDecimals()
        {
            var money = new Money(1234.5m, "inr");
            Assert.Equal("INR 1,234.50", money.ToString());
        }

        [Fact]
        public void Money_Add_SameCurrency_ReturnsSum()
        {
            var a = new Money(10m, "INR");
            var b = new Money(5m, "inr");

            var result = a + b;

            Assert.Equal(15m, result.Amount);
            Assert.Equal("INR", result.Currency);
        }

        [Fact]
        public void Money_Add_DifferentCurrency_ThrowsInvalidOperationException()
        {
            var a = new Money(10m, "USD");
            var b = new Money(5m, "INR");

            Assert.Throws<InvalidOperationException>(() => _ = a + b);
        }

        [Theory]
        [InlineData("A123")]
        [InlineData("Z999")]
        public void ValidSkuAttribute_ValidSku_ReturnsSuccess(string sku)
        {
            var attribute = new ValidSkuAttribute();
            var result = attribute.GetValidationResult(sku, new ValidationContext(new object()));

            Assert.Equal(ValidationResult.Success, result);
        }

        [Theory]
        [InlineData("a123")]
        [InlineData("AB12")]
        [InlineData("1234")]
        [InlineData("A12")]
        [InlineData("")]
        [InlineData(null)]
        public void ValidSkuAttribute_InvalidSku_ReturnsValidationResult(string sku)
        {
            var attribute = new ValidSkuAttribute();
            var result = attribute.GetValidationResult(sku, new ValidationContext(new object()));

            Assert.NotNull(result);
            Assert.Equal("SKU must be in format A123", result.ErrorMessage);
        }
    }
}
