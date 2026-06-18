# Task 2.1 / Task 2.2 — EF Core Model Configuration and Soft Delete

Solution file:
- `HON.Orders.Data/HonOrdersDbContext.cs`

Implementation details:
- Configures entity keys, required fields, lengths, and precision.
- Adds row version concurrency tokens.
- Uses shadow properties for `IsDeleted`, `CreatedBy`, and `LastModified`.
- Applies global query filters for soft-delete support.
- Configures relationships and behaviors for orders, products, payments, and customers.
