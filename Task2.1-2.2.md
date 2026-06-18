# Task 2.1 / Task 2.2 — EF Core Model Configuration and Soft Delete

Solution file:
- `HON.Orders.Data/HonOrdersDbContext.cs`

Implementation details:
- Configures entities with keys, required fields, field lengths, and precision.
- Adds row version concurrency tokens for `Product` and `Order`.
- Defines shadow properties for `IsDeleted`, `CreatedBy`, and `LastModified`.
- Applies global query filters so soft-deleted entities are excluded automatically.
- Configures relationships between orders, order items, payments, and customers.
