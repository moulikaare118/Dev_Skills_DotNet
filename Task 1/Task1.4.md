# Task 1.4 — Dynamic Order Filter Builder

Solution file:
- `HON.Orders.Domain/Filters/OrderFilterBuilder.cs`

Implementation details:
- Builds an `Expression<Func<Order, bool>>` dynamically.
- Supports filtering by status, date range, minimum total, and customer email.
- Combines predicates using expression composition.
