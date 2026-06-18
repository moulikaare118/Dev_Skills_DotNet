namespace HON.Orders.Domain.Filters;

using System.Linq.Expressions;
using HON.Orders.Domain.Entities;

// task1.4 - Build dynamic order predicates for optional criteria
public static class OrderFilterBuilder
{
    public static Expression<Func<Order, bool>> Build(
        string? status,
        DateTime? from,
        DateTime? to,
        decimal? minTotal,
        string? customerEmail)
    {
        Expression<Func<Order, bool>> filter = x => true;

        if (!string.IsNullOrWhiteSpace(status))
        {
            filter = filter.And(x => x.Status == status);
        }

        if (from is DateTime fromDate)
        {
            filter = filter.And(x => x.OrderDate >= fromDate);
        }

        if (to is DateTime toDate)
        {
            filter = filter.And(x => x.OrderDate <= toDate);
        }

        if (minTotal.HasValue)
        {
            filter = filter.And(x => x.Total >= minTotal.Value);
        }

        if (!string.IsNullOrWhiteSpace(customerEmail))
        {
            filter = filter.And(x => x.Customer != null && x.Customer.Email == customerEmail);
        }

        return filter;
    }

    private static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> left, Expression<Func<T, bool>> right)
    {
        var param = Expression.Parameter(typeof(T));
        var leftBody = Expression.Invoke(left, param);
        var rightBody = Expression.Invoke(right, param);
        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(leftBody, rightBody), param);
    }
}
