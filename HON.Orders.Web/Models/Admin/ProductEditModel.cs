using System.ComponentModel.DataAnnotations;

namespace HON.Orders.Web.Models.Admin;

public class ProductEditModel
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Sku { get; set; } = null!;

    [Required]
    [DataType(DataType.Currency)]
    public decimal UnitPrice { get; set; }

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = null!;

    [Required]
    public int StockQuantity { get; set; }
}
