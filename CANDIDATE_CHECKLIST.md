# HON Orders Assessment — Candidate Progress Checklist

## Before You Start

- [ ] Read ASSESSMENT_SPECIFICATION.md completely
- [ ] Review QUICK_START_GUIDE.md for project setup
- [ ] Check SOLUTION_TEMPLATE.md for expected structure
- [ ] Understand time allocation: 90 minutes total
- [ ] Ensure .NET 8.0 SDK is installed
- [ ] Have SQL Server (LocalDB) ready

---

## Project Setup (First 10 minutes)

### Create Solution & Projects
- [ ] Created `HON.Orders` solution
- [ ] Created `HON.Orders.Domain` class library
- [ ] Created `HON.Orders.Data` class library
- [ ] Created `HON.Orders.Web` MVC project
- [ ] Created `HON.Orders.Tests` xUnit test project
- [ ] All projects added to solution

### Add Dependencies
- [ ] Domain: added required packages
- [ ] Data: added EF Core packages
- [ ] Web: added EF Core packages
- [ ] Tests: added xUnit and in-memory DB packages
- [ ] Cross-project references configured

### Solution Builds
- [ ] `dotnet build` succeeds
- [ ] No build errors or warnings

---

## Section 1: C# & LINQ (25 minutes)

### Task 1.1 — Money Value Object (8 min)

- [ ] Created `HON.Orders.Domain/ValueObjects/Money.cs`
- [ ] **Immutability:**
  - [ ] Properties are read-only
  - [ ] No setters on public properties
- [ ] **Constructor & Validation:**
  - [ ] Validates Amount >= 0
  - [ ] Throws ArgumentException for invalid input
  - [ ] Currency defaults to "USD"
- [ ] **Operators:**
  - [ ] Addition operator `+` implemented
  - [ ] Subtraction operator `-` implemented
  - [ ] Multiplication operator `*` implemented
  - [ ] Currency validation in operators
- [ ] **Equals & ToString:**
  - [ ] `Equals()` implemented
  - [ ] `GetHashCode()` implemented
  - [ ] `ToString()` returns "USD 99.99" format
- [ ] **Extension Method:**
  - [ ] `FormatMoney()` extension on decimal created
  - [ ] Uses Money value object internally
  - [ ] Returns formatted string
- [ ] Unit tests written and passing

### Task 1.2 — LINQ: Top 5 Customers (10 min)

- [ ] Created `HON.Orders.Domain/Services/OrderService.cs`
- [ ] Created `HON.Orders.Domain/DTOs/TopCustomerDto.cs`
- [ ] **Method Signature:**
  - [ ] Returns `IEnumerable<TopCustomerDto>`
  - [ ] Takes `days` parameter (default 30)
  - [ ] Takes `topCount` parameter (default 5)
- [ ] **Date Filtering:**
  - [ ] Filters orders from last N days
  - [ ] Uses `DateTime.UtcNow.AddDays(-days)`
- [ ] **LINQ Operations:**
  - [ ] Uses `GroupBy(o => o.Customer)`
  - [ ] Uses `SelectMany()` or navigations for OrderItems
  - [ ] Uses `OrderByDescending()` on revenue
  - [ ] Uses `.Take(topCount)`
- [ ] **DTO Population:**
  - [ ] CustomerName populated
  - [ ] OrdersCount populated (group count)
  - [ ] Revenue calculated and populated
- [ ] Unit tests with in-memory data pass

### Task 1.3 — Async Streams (5 min)

- [ ] Created async iterator in `OrderService`
- [ ] **Method Signature:**
  - [ ] Returns `IAsyncEnumerable<Order>`
  - [ ] Takes `DateTime since` parameter
  - [ ] Takes optional `CancellationToken`
- [ ] **Implementation:**
  - [ ] Uses `Skip()` and `Take()` for pagination
  - [ ] Default page size is 20
  - [ ] Uses `yield return` (lazy evaluation)
  - [ ] Loops until no results remain
- [ ] **Cancellation:**
  - [ ] `CancellationToken` passed to `ToListAsync(ct)`
  - [ ] Can be cancelled externally
- [ ] **Usage Example:**
  - [ ] `await foreach` example documented or tested
  - [ ] Shows lazy loading in action

### Task 1.4 — Dynamic Predicates (2 min)

- [ ] Created `HON.Orders.Domain/Filters/OrderFilterBuilder.cs`
- [ ] **Method Signature:**
  - [ ] Takes optional status, date range, min total, customer email
  - [ ] Returns `Expression<Func<Order, bool>>`
- [ ] **Filters Implemented:**
  - [ ] Status filter (if provided)
  - [ ] FromDate filter (if provided)
  - [ ] ToDate filter (if provided)
  - [ ] MinTotal filter (if provided)
  - [ ] CustomerEmail filter (if provided)
- [ ] **Expression Composition:**
  - [ ] Only includes non-null parameters
  - [ ] Uses AND logic (`&&`)
  - [ ] Compiles to valid Expression
- [ ] **EF Core Compatibility:**
  - [ ] Query translates to SQL (no client-side evaluation)
  - [ ] Integration test passes with EF Core

---

## Section 2: Entity Framework Core (20 minutes)

### Task 2.1 — Fluent Configuration & Concurrency (12 min)

- [ ] Created all entities in `HON.Orders.Domain/Entities/`
  - [ ] `Customer.cs`
  - [ ] `Product.cs`
  - [ ] `Order.cs`
  - [ ] `OrderItem.cs`
  - [ ] `Payment.cs`
  - [ ] `AuditLog.cs`
- [ ] Created `HON.Orders.Data/AppDbContext.cs`
- [ ] **Relationships Configured:**
  - [ ] Customer → Orders (1-to-Many, CascadeDelete)
  - [ ] Order → OrderItems (1-to-Many)
  - [ ] Order → Payments (1-to-Many)
  - [ ] Product → OrderItems (1-to-Many)
  - [ ] All navigation properties bidirectional
- [ ] **Property Configuration:**
  - [ ] Product.UnitPrice → `HasPrecision(18, 2)`
  - [ ] Order.Total → `HasPrecision(18, 2)`
  - [ ] String lengths configured (Name, Sku, etc.)
- [ ] **Unique Constraints:**
  - [ ] Order.OrderNumber → unique index
  - [ ] Customer.Email → unique index
  - [ ] Product.Sku → unique index
- [ ] **Shadow Properties:**
  - [ ] CreatedAt added via Fluent API
  - [ ] LastModifiedAt added via Fluent API
  - [ ] Applied to: Customer, Product, Order, OrderItem, Payment
- [ ] **Concurrency Control:**
  - [ ] Product.RowVersion → `IsRowVersion()`
  - [ ] Order.RowVersion → `IsRowVersion()`
  - [ ] Byte array type used
- [ ] **Seed Data:**
  - [ ] At least 3 customers seeded
  - [ ] At least 5 products seeded
  - [ ] At least 3 orders with items seeded
- [ ] **Migrations:**
  - [ ] `dotnet ef migrations add InitialCreate` ran successfully
  - [ ] Migration files in `Migrations/` folder
  - [ ] `dotnet ef database update` succeeds

### Task 2.2 — Soft Delete & Query Filters (8 min)

- [ ] Created `HON.Orders.Data/IHasSoftDelete.cs` interface
- [ ] **IsDeleted Property:**
  - [ ] Added to: Customer, Product, Order, OrderItem, Payment
  - [ ] Defaults to false
  - [ ] Not an interface requirement (but best practice)
- [ ] **Global Query Filters Configured:**
  - [ ] Customer filter: `!c.IsDeleted`
  - [ ] Product filter: `!p.IsDeleted`
  - [ ] Order filter: `!o.IsDeleted`
  - [ ] OrderItem filter: `!oi.IsDeleted`
  - [ ] Payment filter: `!pa.IsDeleted`
- [ ] **Admin Override:**
  - [ ] Created `IncludeDeleted<T>()` method in context
  - [ ] Uses `IgnoreQueryFilters()`
  - [ ] Accessible in controllers
- [ ] **Admin Views:**
  - [ ] Product list calls `IncludeDeleted<Product>()`
  - [ ] Shows deleted and active records
  - [ ] Regular views only show active records
- [ ] **Migration:**
  - [ ] `IsDeleted` column added to migration
  - [ ] Migration applies successfully
- [ ] Unit tests verify filtering works

---

## Section 3: ASP.NET Core MVC (35 minutes)

### Task 3.1 — UX & Layout (8 min)

- [ ] **_Layout.cshtml Created:**
  - [ ] Navigation bar with links: Home, Catalog, Orders, Admin
  - [ ] Footer with copyright
  - [ ] `@RenderBody()` placeholder
  - [ ] CSS/JS properly linked
  - [ ] Bootstrap 5 (or similar) included
- [ ] **Responsive Design:**
  - [ ] Layout works on mobile
  - [ ] Navigation collapses on small screens
  - [ ] Tables/forms properly styled
- [ ] **Partial Views:**
  - [ ] `_ValidationSummary.cshtml` created
  - [ ] `_SummaryCard.cshtml` created
  - [ ] Both render correctly
- [ ] **View Component:**
  - [ ] `OrderSummary` view component created
  - [ ] Shows recent orders
  - [ ] Displays: OrderNumber, CustomerName, Total, Status
- [ ] **Tag Helpers:**
  - [ ] Uses `asp-for`, `asp-action`, `asp-controller`
  - [ ] Uses `asp-validation-for`
  - [ ] Validation messages display correctly
- [ ] **Home/Index View:**
  - [ ] Dashboard created
  - [ ] Shows summary cards (using partial)
  - [ ] Shows recent orders (using view component)

### Task 3.2 — Filters (8 min)

- [ ] **ExecutionTimeFilterAttribute Created:**
  - [ ] Location: `HON.Orders.Web/Filters/ExecutionTimeFilterAttribute.cs`
  - [ ] Derives from `ActionFilterAttribute`
  - [ ] Implements `OnActionExecuting()`: starts Stopwatch
  - [ ] Implements `OnActionExecuted()`: stops Stopwatch
  - [ ] Calculates elapsed milliseconds
  - [ ] Adds `Server-Timing` response header
  - [ ] Logs execution time to console
  - [ ] Can be applied as `[ExecutionTimeFilter]`
- [ ] **AdminRoleCheckAttribute Created:**
  - [ ] Location: `HON.Orders.Web/Filters/AdminRoleCheckAttribute.cs`
  - [ ] Implements `IAuthorizationFilter`
  - [ ] Checks `User.HasClaim("role", "Admin")`
  - [ ] Returns `ForbidResult()` (403) if not authorized
  - [ ] Can be applied as `[AdminRoleCheck]`
- [ ] **Filters Applied:**
  - [ ] ExecutionTimeFilter on at least one controller
  - [ ] AdminRoleCheck on Admin area controller

### Task 3.3 — Admin Area CRUD (12 min)

- [ ] **Admin Area Structure:**
  - [ ] `Areas/Admin/` folder created
  - [ ] `Areas/Admin/Controllers/ProductController.cs` created
  - [ ] `Areas/Admin/Views/Product/` folder created
  - [ ] Area route registered in Program.cs
- [ ] **ProductController Actions:**
  - [ ] `Index` (GET): Lists products, pagination
  - [ ] `Create` (GET): Shows form
  - [ ] `Create` (POST): Saves product, redirects
  - [ ] `Edit` (GET): Shows pre-populated form
  - [ ] `Edit` (POST): Updates product, redirects
  - [ ] `Delete` (GET): Shows confirmation
  - [ ] `Delete` (POST): Soft-deletes product, redirects
- [ ] **View Templates:**
  - [ ] `Index.cshtml`: Product table, pagination
  - [ ] `Create.cshtml`: Form with validation
  - [ ] `Edit.cshtml`: Pre-populated form
  - [ ] `Delete.cshtml`: Confirmation prompt
- [ ] **Antiforgery Protection:**
  - [ ] `@Html.AntiForgeryToken()` on all POST forms
  - [ ] `[ValidateAntiForgeryToken]` on POST actions
  - [ ] No antiforgery errors
- [ ] **TempData & PRG Pattern:**
  - [ ] POST creates TempData["Success"] or TempData["Error"]
  - [ ] POST redirects to Index or Edit
  - [ ] TempData message displays in _Layout or partial
  - [ ] Messages clear after display
- [ ] **Server-Side Validation:**
  - [ ] `ModelState.IsValid` checked in POST actions
  - [ ] Validation errors returned to form view
- [ ] **ProductViewModel:**
  - [ ] Created with all required fields
  - [ ] Validation attributes applied
  - [ ] Mapped to/from Product entity

### Task 3.4 — Client-Side Behavior (7 min)

- [ ] **Unobtrusive Validation:**
  - [ ] jQuery Validation included in layout
  - [ ] Validation attributes on form inputs
  - [ ] Errors display on blur/change
  - [ ] No page reload on validation
  - [ ] Submit button disabled until valid (optional)
- [ ] **Order Create Form:**
  - [ ] Form accepts customer selection
  - [ ] Line items can be added dynamically
  - [ ] Each item: ProductId (dropdown), Quantity (number)
- [ ] **Dynamic Line Items JavaScript:**
  - [ ] "Add Item" button adds new row
  - [ ] Each row has unique index
  - [ ] "Remove Item" button removes row
  - [ ] Form names use array syntax: `items[0].ProductId`
- [ ] **Real-Time Calculations:**
  - [ ] Line total updates: Quantity × UnitPrice
  - [ ] Order total updates: sum of line totals
  - [ ] Displays formatted currency
- [ ] **Custom Tag Helper:**
  - [ ] `CurrencyFormatterTagHelper` created
  - [ ] Renders `<currency value="99.99" currency="USD"></currency>`
  - [ ] Outputs formatted string (e.g., "USD 99.99")
  - [ ] Uses Money value object (if available)
- [ ] **Form Binding:**
  - [ ] POST form binds correctly
  - [ ] `ModelState.IsValid` passes with line items
  - [ ] OrderItem array deserializes correctly

---

## Section 4: Testing (10 minutes)

- [ ] **MoneyTests Created:**
  - [ ] Test constructor with valid amount
  - [ ] Test constructor with negative amount (throws)
  - [ ] Test addition operator
  - [ ] Test subtraction operator
  - [ ] Test multiplication operator
  - [ ] Test Equals/ToString
- [ ] **OrderServiceTests Created:**
  - [ ] Test GetTopCustomersByRevenue returns top 5
  - [ ] Test GetTopCustomersByRevenue date filtering
  - [ ] Test StreamOrdersAsync pagination
  - [ ] Test StreamOrdersAsync lazy loading
  - [ ] Test BuildFilter expression composition
- [ ] **ProductServiceTests Created:**
  - [ ] Test create product
  - [ ] Test update product
  - [ ] Test soft delete
- [ ] **Test Quality:**
  - [ ] All tests use AAA pattern (Arrange, Act, Assert)
  - [ ] Descriptive test names
  - [ ] In-memory DbContext for integration tests
  - [ ] Proper assertions (Assert.Equal, Assert.Throws, etc.)
- [ ] **Test Execution:**
  - [ ] `dotnet test` runs successfully
  - [ ] All tests pass
  - [ ] No skipped tests (unless noted)

---

## Final Verification (Last 5 minutes)

### Build & Run
- [ ] `dotnet build` succeeds (no errors/warnings)
- [ ] `dotnet test` passes (all tests)
- [ ] `dotnet run` starts web app successfully
- [ ] Web app accessible at `https://localhost:5001`

### Database
- [ ] Database migrations applied
- [ ] Seed data visible in views
- [ ] Admin area only shows active products (soft delete working)

### Functionality
- [ ] Home page displays dashboard
- [ ] Catalog page lists products
- [ ] Can create order with line items
- [ ] Admin can CRUD products
- [ ] Admin can see deleted products
- [ ] Validation messages display
- [ ] Antiforgery tokens work

### Code Quality
- [ ] Naming conventions consistent
- [ ] Code organized in correct folders
- [ ] No compile warnings
- [ ] Comments on complex logic
- [ ] All required fields present

### Submission
- [ ] Created `.gitignore` (excludes bin/obj/.vs/)
- [ ] Created README.md with setup instructions
- [ ] Solution ready for zipping
- [ ] All files committed (if using git)

---

## Time Management Tips

| Time | Section | Goal |
|------|---------|------|
| 0–10 min | Setup | Projects created, dependencies added, solution builds |
| 10–35 min | C# & LINQ | All LINQ tasks complete, Money VO done |
| 35–55 min | EF Core | DbContext, migrations, soft delete filters |
| 55–90 min | MVC + Tests | Controllers, views, CRUD, admin filters, tests |

---

## Quick Wins (If You're Tight on Time)

**Prioritize these if running short:**

1. ✅ Money VO + FormatMoney extension (quick 5 min)
2. ✅ Fluent DbContext config + migrations (10 min)
3. ✅ Admin Product CRUD (10 min)
4. ✅ Basic tests (5 min)
5. ✅ OrderService LINQ (5 min)

**Nice-to-Have (if you have time):**

- Async streams pagination
- Complex expression tree filters
- Unobtrusive validation
- View components
- Advanced styling

---

## Resources

- ASSESSMENT_SPECIFICATION.md — Full requirements
- QUICK_START_GUIDE.md — Getting started
- SOLUTION_TEMPLATE.md — Expected structure & code samples
- GRADING_GUIDE.md — How you'll be evaluated

---

## Last-Minute Checklist

**5 minutes before submission:**
- [ ] Build succeeds
- [ ] Tests pass (or 80%+)
- [ ] Web app runs without exceptions
- [ ] README included
- [ ] Solution zipped
- [ ] Submitted on time

---

**Good Luck! 🚀**

You've got this. Focus on quality over perfection. Each section you complete earns points!
