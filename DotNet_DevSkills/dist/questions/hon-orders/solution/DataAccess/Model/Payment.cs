using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Model
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int OrderId { get; set; }
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        [Required]
        [StringLength(50)]
        public string Method { get; set; }
        [Required]
        public DateTime PaidAt { get; set; }
        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
    }
}
