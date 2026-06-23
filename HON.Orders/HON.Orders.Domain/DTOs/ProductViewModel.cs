using System.ComponentModel.DataAnnotations;

namespace HON.Orders.Domain.DTOs
{
    /// <summary>
    /// View model for Product create/edit operations
    /// </summary>
    public class ProductViewModel
    {
        public int Id { get; set; }

        [Required]
        [StringLength(150, MinimumLength = 3)]
        public string Name { get; set; } = null!;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string Sku { get; set; } = null!;

        [Required]
        [Range(0.01, 999999.99)]
        public decimal UnitPrice { get; set; }

        [StringLength(50)]
        public string? Category { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
    }
}
