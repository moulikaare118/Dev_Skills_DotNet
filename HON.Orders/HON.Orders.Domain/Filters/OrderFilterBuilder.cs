namespace HON.Orders.Domain.Filters
{
  public class OrderFilterBuilder
  {
    public Expression<Func<Order, bool>> BuildFilter(
      string status = null,
      DateTime? fromDate = null,
      DateTime? toDate = null,
      decimal? minTotal = null,
      string customerEmail = null)
    {
      // TODO: Build an EF Core-friendly dynamic predicate with optional criteria
      // so orders can be filtered by status, date range, minimum total, and customer email.
      var parameter = Expression.Parameter(typeof(Order), "o");
      var expressions = new List<Expression>();

      if (!string.IsNullOrEmpty(status))
      {
        if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
        {
          var statusProperty = Expression.Property(parameter, nameof(Order.Status));
          var statusConstant = Expression.Constant(orderStatus);
          expressions.Add(Expression.Equal(statusProperty, statusConstant));
        }
      }

      if (fromDate.HasValue)
      {
        var dateProperty = Expression.Property(parameter, nameof(Order.OrderDate));
        var dateConstant = Expression.Constant(fromDate.Value);
        expressions.Add(Expression.GreaterThanOrEqual(dateProperty, dateConstant));
      }

      if (toDate.HasValue)
      {
        var dateProperty = Expression.Property(parameter, nameof(Order.OrderDate));
        var dateConstant = Expression.Constant(toDate.Value);
        expressions.Add(Expression.LessThanOrEqual(dateProperty, dateConstant));
      }

      if (minTotal.HasValue)
      {
        var totalProperty = Expression.Property(parameter, nameof(Order.Total));
        var totalConstant = Expression.Constant(minTotal.Value);
        expressions.Add(Expression.GreaterThanOrEqual(totalProperty, totalConstant));
      }

      if (!string.IsNullOrEmpty(customerEmail))
      {
        var customerProperty = Expression.Property(parameter, nameof(Order.Customer));
        var emailProperty = Expression.Property(customerProperty, nameof(Customer.Email));
        var emailConstant = Expression.Constant(customerEmail);
        var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
        expressions.Add(Expression.Call(emailProperty, containsMethod, emailConstant));
      }

      if (expressions.Count == 0)
        return o => true;

      Expression combined = expressions[0];
      foreach (var expr in expressions.Skip(1))
        combined = Expression.AndAlso(combined, expr);

      return Expression.Lambda<Func<Order, bool>>(combined, parameter);
    }
  }
}