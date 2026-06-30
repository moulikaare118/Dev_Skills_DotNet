using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.ValueObject
{
    public class TopCustomerDTO
    {
        public string CustomerName { get; set; } = "";
        public int OrdersCount { get; set; }
        public decimal Revenue { get; set; }
    }
}
