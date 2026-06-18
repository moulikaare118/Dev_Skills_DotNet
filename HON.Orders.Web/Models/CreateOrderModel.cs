using System.ComponentModel.DataAnnotations;
using HON.Orders.Domain.Entities;

namespace HON.Orders.Web.Models;

public class CreateOrderModel
{
    [Required]
    public int CustomerId { get; set; }

    public List<Customer> Customers { get; set; } = new();

    public List<Product> Products { get; set; } = new();

    public List<OrderLineItemModel> LineItems { get; set; } = new();
}
