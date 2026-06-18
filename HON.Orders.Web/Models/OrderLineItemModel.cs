using System.ComponentModel.DataAnnotations;

namespace HON.Orders.Web.Models;

public class OrderLineItemModel
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    [Required]
    public decimal UnitPrice { get; set; }
}
