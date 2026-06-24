using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace HONOrdersApp.Models
{
    public class OrderViewModel
    {
        public int Id { get; set; }

        [Required]
        public string OrderNumber { get; set; } = "";

        [Required]
        public DateTime OrderDate { get; set; }

        [Required(ErrorMessage = "Please select customer")]
        public int CustomerId { get; set; }

        public string Status { get; set; } = "";

        [Range(1, 1000000)]
        public decimal Total { get; set; }

        [Required]
        public decimal PaymentAmount { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = "";


        public List<SelectListItem>? Customers { get; set; }

  
        public List<OrderItemViewModel> Items { get; set; } = new();

        public List<SelectListItem>? Products { get; set; }

       
    }
}

