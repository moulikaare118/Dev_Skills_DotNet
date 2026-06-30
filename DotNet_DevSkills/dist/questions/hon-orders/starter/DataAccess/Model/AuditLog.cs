using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Model
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public string EntityName { get; set; }
        [Required]
        public int EntityId { get; set; }
        [Required]
        [StringLength(50)]
        public string Action { get; set; }
        [Required]
        [StringLength(100)]
        public string Username { get; set; }
        [Required]
        public DateTime OccurredAt { get; set; }
        [StringLength(1000)]
        public string Details { get; set; }
    }
}
