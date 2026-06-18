# Task 1.4 — Dynamic Order Filter Builder

Solution file:
- `HON.Orders.Domain/Filters/OrderFilterBuilder.cs`

Implementation details:
- Builds a reusable `Expression<Func<Order, bool>>` predicate.
- Supports optional filter criteria: status, date range, minimum total, customer email.
- Combines filters using expression composition to keep the query dynamic.
