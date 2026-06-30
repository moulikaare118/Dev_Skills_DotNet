using DataAccess.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Helper
{
    public static class OrderPredicateBuilder
    {
        public static Expression<Func<Order, bool>> Build(
        string? status,
        DateTime? fromDate,
        DateTime? toDate,
        decimal? minTotal,
        string? customerEmail)
        {
            Expression<Func<Order, bool>> predicate = o => true;

            if (!string.IsNullOrWhiteSpace(status))
                predicate = predicate.And(o => o.Status == status);

            if (fromDate.HasValue)
                predicate = predicate.And(o => o.OrderDate >= fromDate.Value);

            if (toDate.HasValue)
                predicate = predicate.And(o => o.OrderDate <= toDate.Value);

            if (minTotal.HasValue)
                predicate = predicate.And(o => o.Total >= minTotal.Value);

            if (!string.IsNullOrWhiteSpace(customerEmail))
                predicate = predicate.And(o => o.Customer.Email == customerEmail);

            return predicate;
        }
    }
}
