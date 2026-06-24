# HON Orders Tasks and Solutions

This document maps the HON Orders assessment tasks to the files and implementation areas in the workspace.

## Workspace focus
- `HON.Orders.code-workspace` has been created to open only the `HON.Orders` project tree.
- The HON Orders solution files are under:
  - `HON.Orders.Domain/`
  - `HON.Orders.Data/`
  - `HON.Orders.Web/`
  - `HON.Orders.Tests/`

## Section 1 — C# Programming & LINQ

### Task 1.1 — Money value object & extension
- `HON.Orders.Domain/ValueObjects/Money.cs`
  - `Money` value object implementation
  - arithmetic operators
  - `DecimalExtensions.FormatMoney()` extension method

### Task 1.2 — Top customers by revenue
- `HON.Orders.Domain/Services/OrderService.cs`
  - `GetTopCustomersByRevenue(...)`
  - returns `TopCustomerDto`
  - uses `GroupBy`, `SelectMany`, and `OrderByDescending`

### Task 1.3 — Async Streams
- `HON.Orders.Domain/Services/OrderService.cs`
  - `StreamOrdersAsync(...)`
  - lazy paged `IAsyncEnumerable<Order>` implementation

### Task 1.4 — Dynamic Predicate (Expression Trees)
- `HON.Orders.Domain/Filters/OrderFilterBuilder.cs`
  - `BuildFilter(...)`
  - composable `Expression<Func<Order, bool>>`
  - supports optional criteria: status, date range, min total, customer email

## Section 2 — EF Core

### Task 2.1 — Fluent Config & Concurrency
- `HON.Orders.Data/AppDbContext.cs`
  - `DbSet` definitions for domain entities
  - Fluent API for decimal precision and `RowVersion`
  - relationship mappings and cascade behavior
  - shadow audit properties: `CreatedAt`, `LastModifiedAt`

### Task 2.2 — Soft Delete & Query Filters
- `HON.Orders.Data/AppDbContext.cs`
  - global query filters for `IsDeleted`
  - `IHasSoftDelete` interface used by entities
  - admin screens can include deleted data using `IncludeDeleted<T>()`

## Section 3 — ASP.NET Core MVC

### Task 3.1 — UX & Layout
- `HON.Orders.Web/Views/Shared/_Layout.cshtml`
  - responsive layout and navigation
- `HON.Orders.Web/TagHelpers/CurrencyFormatterTagHelper.cs`
  - custom currency formatting tag helper
- `HON.Orders.Web/wwwroot/js/site.js`
  - client-side order form behavior

### Task 3.2 — Filters
- `HON.Orders.Web/Filters/ExecutionTimeFilterAttribute.cs`
  - action filter adds `Server-Timing` header
- `HON.Orders.Web/Filters/AdminRoleCheckAttribute.cs`
  - authorization filter checks role claim for admin area

### Task 3.3 — Areas & Admin CRUD
- `HON.Orders.Web/Areas/Admin/Controllers/ProductController.cs`
  - create/edit/delete product CRUD
  - uses antiforgery, `TempData`, and PRG pattern
- `HON.Orders.Web/Areas/Admin/Views/Product/`
  - `Create.cshtml`
  - `Index.cshtml`
  - (Edit/Delete views may be added later if missing)

### Task 3.4 — Client-Side Behavior
- `HON.Orders.Web/Controllers/OrderController.cs`
  - order creation form and model binding
  - `CreateOrderViewModel` and `OrderLineItemViewModel` usage
- `HON.Orders.Web/wwwroot/js/site.js`
  - dynamic add/remove line items and live order total

## Additional supporting files
- `HON.Orders.Web/Controllers/HomeController.cs`
  - home dashboard summary and recent orders
- `HON.Orders.Web/Controllers/CatalogController.cs`
  - catalog browsing and search
- `HON.Orders.Domain/DTOs/`
  - `ProductViewModel.cs`
  - `CreateOrderViewModel.cs`
  - `OrderLineItemViewModel.cs`
  - `HomeDashboardViewModel.cs`

## Notes
- TODO comments have been added in many files to highlight where assessment tasks should be completed or improved.
- This document is intended to centralize the HON Orders solution mapping for the assessment tasks.
