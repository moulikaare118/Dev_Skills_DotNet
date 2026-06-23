# HON Orders — 90-Minute .NET Practical Assessment

## Overview

Build a mini **order-management MVC web application** demonstrating hands-on competency in:

- **C#** & modern language features
- **LINQ** (queries, grouping, joins)
- **SQL Server** (via EF Core)
- **Entity Framework Core** (configuration, migrations, querying)
- **ASP.NET Core MVC** (controllers, views, model binding, validation)
- **Testing** (xUnit, AAA pattern)

### Constraints

- **Do NOT** build or consume Web APIs
- Focus on **ASP.NET Core MVC** with server-side rendering
- Use **Entity Framework Core** for data access
- Implement **xUnit** tests for core business logic

---

## Solution Structure

### Expected Submission

**Solution Name:** `HON.Orders`

**Project Structure:**

```
HON.Orders/
├── HON.Orders.Web              (ASP.NET Core MVC - Controllers, Views)
├── HON.Orders.Data             (EF Core DbContext, Migrations)
├── HON.Orders.Domain           (Entities, Value Objects, DTOs)
├── HON.Orders.Tests            (xUnit Test Project)
└── HON.Orders.sln
```

### Database Target

- **SQL Server** (LocalDB or Express)
- Auto-migration on startup (optional but recommended)

---

## Domain Model Specification

All entities must include at minimum the specified fields:

### **Customer**
```
Id              (int, PK)
Name            (string, required, max 100)
Email           (string, required, unique, max 100)
CreatedAt       (DateTime, shadow property)
LastModifiedAt  (DateTime, shadow property)
IsDeleted       (bool, for soft delete)
```

### **Product**
```
Id              (int, PK)
Name            (string, required, max 150)
Sku             (string, required, unique, max 50)
UnitPrice       (decimal(18,2), required, > 0)
Category        (string, max 50)
StockQuantity   (int, >= 0)
RowVersion      (byte[], concurrency token)
CreatedAt       (DateTime, shadow property)
LastModifiedAt  (DateTime, shadow property)
IsDeleted       (bool, for soft delete)
```

### **Order**
```
Id              (int, PK)
OrderNumber     (string, unique, e.g., "ORD-20260101-0001")
CustomerId      (int, FK → Customer)
Customer        (navigation property)
OrderDate       (DateTime, defaults to UtcNow)
Status          (enum: Pending, Confirmed, Shipped, Delivered, Cancelled)
Total           (decimal(18,2), computed from OrderItems)
RowVersion      (byte[], concurrency token)
OrderItems      (collection navigation)
Payments        (collection navigation)
CreatedAt       (DateTime, shadow property)
LastModifiedAt  (DateTime, shadow property)
IsDeleted       (bool, for soft delete)
```

### **OrderItem**
```
Id              (int, PK)
OrderId         (int, FK → Order)
ProductId       (int, FK → Product)
Quantity        (int, required, > 0)
UnitPrice       (decimal(18,2), snapshot from Product)
LineTotal       (decimal(18,2), computed: Quantity * UnitPrice)
Product         (navigation property)
Order           (navigation property)
CreatedAt       (DateTime, shadow property)
IsDeleted       (bool, for soft delete)
```

### **Payment**
```
Id              (int, PK)
OrderId         (int, FK → Order)
Amount          (decimal(18,2), required)
Method          (enum: CreditCard, Debit, Check, Bank, Other)
PaidAt          (DateTime, nullable)
Order           (navigation property)
CreatedAt       (DateTime, shadow property)
IsDeleted       (bool, for soft delete)
```

### **AuditLog**
```
Id              (int, PK)
EntityName      (string, e.g., "Order", "Product")
EntityId        (int)
Action          (string, e.g., "Created", "Modified", "Deleted")
Username        (string)
OccurredAt      (DateTime)
Details         (string, JSON or serialized change summary)
```

---

## Assessment Tasks (90 minutes total)

### **Section 1 — C# Programming & LINQ** (25 minutes)

#### **Task 1.1 — Money Value Object** (8 minutes)

**Requirement:**
Implement an immutable `Money` value object in `HON.Orders.Domain`.

```csharp
public class Money
{
    public decimal Amount { get; }
    public string Currency { get; }  // e.g., "USD", "EUR"

    // Constructor
    // ToString() → "USD 99.99" format
    // Equality / GetHashCode()
    // Arithmetic operators: + - * /
    // Validation: Amount must be >= 0
}
```

**Extension Method:**
```csharp
public static string FormatMoney(this decimal amount, string currency = "USD")
{
    return new Money(amount, currency).ToString();
}
```

**Acceptance Criteria:**
- ✓ Value object is immutable
- ✓ Supports `+`, `-`, `*`, `/` operators
- ✓ Proper validation (Amount >= 0)
- ✓ Extension method works on decimal
- ✓ Unit tests pass

---

#### **Task 1.2 — LINQ: Top 5 Customers by Revenue** (10 minutes)

**Requirement:**
Create a service method in `HON.Orders.Domain.Services.OrderService`:

```csharp
public IEnumerable<TopCustomerDto> GetTopCustomersByRevenue(
    int days = 30, 
    int topCount = 5)
{
    // Logic here
}

public class TopCustomerDto
{
    public string CustomerName { get; set; }
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
}
```

**Requirements:**
- Query orders from the last `N` days
- Group by Customer
- Calculate total revenue (sum of OrderItems.LineTotal)
- Sort descending by revenue
- Return top 5

**LINQ Techniques Required:**
- `GroupBy(o => o.Customer)`
- `SelectMany()` or navigation properties
- `OrderByDescending()`
- DateTime filtering

**Acceptance Criteria:**
- ✓ Returns correct top customers
- ✓ Filters by date range
- ✓ Calculates revenue correctly
- ✓ Unit tests with in-memory data pass

---

#### **Task 1.3 — Async Streams** (5 minutes)

**Requirement:**
Implement an async iterator in `OrderService`:

```csharp
public async IAsyncEnumerable<Order> StreamOrdersAsync(
    DateTime since, 
    int pageSize = 20,
    [EnumeratorCancellation] CancellationToken ct = default)
{
    // Implementation
    // yield return orders page by page
}

// Usage example:
// await foreach (var order in service.StreamOrdersAsync(since, ct: token))
// {
//     ProcessOrder(order);
// }
```

**Requirements:**
- Page results (20 per batch)
- Yield results lazily (not load all at once)
- Support cancellation
- Demonstrate usage in a controller or test

**Acceptance Criteria:**
- ✓ Async iterator implemented correctly
- ✓ Pagination working
- ✓ Cancellation token handled
- ✓ Usage example included

---

#### **Task 1.4 — Dynamic Predicates with Expression Trees** (2 minutes)

**Requirement:**
Implement a filter builder in `HON.Orders.Domain.Filters.OrderFilterBuilder`:

```csharp
public class OrderFilterBuilder
{
    public Expression<Func<Order, bool>> BuildFilter(
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        decimal? minTotal = null,
        string? customerEmail = null)
    {
        // Compose expression trees
        // Only add conditions for non-null parameters
    }
}
```

**Requirements:**
- Build dynamic WHERE predicates
- Support optional: Status, Date Range, Minimum Total, Customer Email
- Ensure query remains EF Core-friendly (no client evaluation)
- Return `Expression<Func<Order, bool>>`

**Acceptance Criteria:**
- ✓ Expression trees compose correctly
- ✓ EF Core translates to SQL (no client-side evaluation)
- ✓ Unit tests pass

---

### **Section 2 — Entity Framework Core** (20 minutes)

#### **Task 2.1 — Fluent Configuration & Concurrency** (12 minutes)

**Requirement:**
Configure `AppDbContext` in `HON.Orders.Data`:

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // Fluent API configuration
    }
}
```

**Fluent Configuration Required:**

1. **Relationships:**
   - One-to-Many: Customer → Orders
   - One-to-Many: Order → OrderItems, Payments
   - One-to-Many: Product → OrderItems
   - Cascade delete behavior

2. **Property Configuration:**
   - `Product.UnitPrice` → `decimal(18,2)`
   - `Product.Name` → max length 150
   - `Order.OrderNumber` → unique index
   - `Customer.Email` → unique index

3. **Shadow Properties** (via Fluent API):
   - `CreatedAt` (DateTime)
   - `LastModifiedAt` (DateTime)
   - Applied to: Customer, Product, Order, OrderItem, Payment

4. **Concurrency Control:**
   - `Product.RowVersion` → `IsRowVersion()`
   - `Order.RowVersion` → `IsRowVersion()`

5. **Value Objects:**
   - Configure `Money` as Owned Type (if used in entities)

**Seed Data:**
- At least 3 customers
- At least 5 products with different categories
- At least 3 orders with line items

**Acceptance Criteria:**
- ✓ All fluent configurations in place
- ✓ Migration creates correct schema
- ✓ Relationships work correctly
- ✓ Seed data loads successfully

---

#### **Task 2.2 — Soft Delete & Query Filters** (8 minutes)

**Requirement:**
Implement global query filters in `AppDbContext`:

```csharp
protected override void OnModelCreating(ModelBuilder mb)
{
    // Configure soft-delete query filters
    // By default, exclude IsDeleted = true records
    
    mb.Entity<Customer>()
        .HasQueryFilter(c => !c.IsDeleted);
    
    // Apply to other entities: Product, Order, OrderItem, Payment
}
```

**Admin Override:**
- Create a method to load deleted records:

```csharp
public IQueryable<T> IncludeDeleted<T>() where T : class, IHasSoftDelete
{
    return Set<T>().IgnoreQueryFilters();
}
```

**View Configuration:**
- Admin area can call `IncludeDeleted<Product>()` to see all products
- Regular users only see active records

**Acceptance Criteria:**
- ✓ Query filters configured
- ✓ `IsDeleted = true` records hidden by default
- ✓ `IgnoreQueryFilters()` works in admin views
- ✓ Unit tests pass

---

### **Section 3 — ASP.NET Core MVC** (35 minutes)

#### **Task 3.1 — UX & Layout** (8 minutes)

**Requirement:**
Create a responsive MVC layout and partials.

**Files to Create:**

1. **`Views/Shared/_Layout.cshtml`**
   - Navigation bar (Home, Catalog, Orders, Admin)
   - Footer with copyright
   - Use Bootstrap 5 (CDN)
   - View bag for page title

2. **`Views/Shared/_SummaryCard.cshtml`** (Partial)
   - Display: Title, Count, Value
   - Used in Dashboard

3. **`Views/Shared/Components/OrderSummary/Default.cshtml`** (View Component)
   - Display recent orders
   - Shows: OrderNumber, CustomerName, Total, Status

4. **`Views/Shared/_ValidationSummary.cshtml`** (Partial)
   - Bootstrap-styled validation error display

**Tag Helpers Used:**
- `asp-action`, `asp-controller`
- `asp-for` on form inputs
- `asp-validation-for`

**Acceptance Criteria:**
- ✓ Responsive layout (mobile-friendly)
- ✓ All sections have proper styling
- ✓ Validation messages display correctly
- ✓ View components work

---

#### **Task 3.2 — Filters** (8 minutes)

**Requirement:**

1. **ActionFilter — ExecutionTimeFilter**
   ```csharp
   [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
   public class ExecutionTimeFilterAttribute : ActionFilterAttribute
   {
       public override void OnActionExecuting(ActionExecutingContext context) { }
       public override void OnActionExecuted(ActionExecutedContext context) 
       {
           // Calculate execution time
           // Add Server-Timing response header
           // Log to console/trace
       }
   }
   ```

2. **AuthorizationFilter — AdminRoleCheckAttribute**
   ```csharp
   [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
   public class AdminRoleCheckAttribute : Attribute, IAuthorizationFilter
   {
       public void OnAuthorization(AuthorizationFilterContext context)
       {
           // Check if User has "Admin" role claim
           // If not, return 403 Forbidden
       }
   }
   ```

**Usage:**
```csharp
[ExecutionTimeFilter]
[AdminRoleCheck]
public IActionResult Index() { }
```

**Acceptance Criteria:**
- ✓ ExecutionTimeFilter logs execution time
- ✓ Server-Timing header added
- ✓ AdminRoleCheck blocks non-admin users
- ✓ No Web API filters (MVC only)

---

#### **Task 3.3 — Areas & Admin CRUD** (12 minutes)

**Requirement:**
Create an **Admin area** with **Product CRUD**.

**Folder Structure:**
```
Areas/
└── Admin/
    ├── Controllers/
    │   └── ProductController.cs
    ├── Views/
    │   └── Product/
    │       ├── Index.cshtml
    │       ├── Create.cshtml
    │       ├── Edit.cshtml
    │       └── Delete.cshtml
    └── _ViewImports.cshtml
```

**ProductController Actions:**

| Action | HTTP | Purpose |
|--------|------|---------|
| `Index` | GET | List all products (pagination, search) |
| `Create` | GET | Show product creation form |
| `Create` | POST | Save new product |
| `Edit` | GET | Show edit form |
| `Edit` | POST | Update product |
| `Delete` | GET | Show delete confirmation |
| `Delete` | POST | Soft-delete product |

**Requirements:**
- **Antiforgery Protection:** Use `@Html.AntiForgeryToken()` on all POST forms
- **TempData Notifications:** Show success/error messages
- **PRG Pattern:** Redirect after POST
- **Validation:** Server-side validation on ProductViewModel
- **Authorization:** Apply `AdminRoleCheck` filter

**ProductViewModel:**
```csharp
public class ProductViewModel
{
    public int Id { get; set; }
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Sku { get; set; }
    
    [Required]
    [Range(0.01, 999999.99)]
    public decimal UnitPrice { get; set; }
    
    [StringLength(50)]
    public string Category { get; set; }
    
    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }
}
```

**Acceptance Criteria:**
- ✓ All CRUD operations work
- ✓ Antiforgery tokens on all POST forms
- ✓ PRG pattern implemented
- ✓ TempData success/error messages
- ✓ Pagination on Index view
- ✓ `AdminRoleCheck` filter applied

---

#### **Task 3.4 — Client-Side Behavior & Custom Tag Helper** (7 minutes)

**Requirement:**

1. **Unobtrusive Validation**
   - Use jQuery Unobtrusive Validation
   - Display validation errors on blur/change
   - Submit button disabled until form is valid (optional but nice)

2. **Dynamic Order Line Items**
   Create `/Orders/Create` form with **Add/Remove Line Items** buttons.

   ```html
   <!-- Initial line item row -->
   <div class="line-item-row" data-index="0">
       <select name="items[0].ProductId" class="form-control"></select>
       <input type="number" name="items[0].Quantity" />
       <button type="button" class="btn btn-sm btn-danger remove-item">Remove</button>
   </div>
   
   <!-- JavaScript adds/removes rows dynamically -->
   <button type="button" id="addLineItem" class="btn btn-sm btn-success">Add Item</button>
   ```

   **JavaScript Requirements:**
   - Track unique indices
   - Handle product selection (populate price via AJAX or hardcode)
   - Calculate line total: Quantity × UnitPrice
   - Update order total in real-time
   - Remove button removes rows

3. **Custom Tag Helper — CurrencyFormatter**
   ```csharp
   [HtmlTargetElement("currency")]
   public class CurrencyFormatterTagHelper : TagHelper
   {
       [HtmlAttributeName("value")]
       public decimal Value { get; set; }
       
       [HtmlAttributeName("currency")]
       public string Currency { get; set; } = "USD";
       
       public override void Process(TagHelperContext context, TagHelperOutput output)
       {
           // Format: USD 99.99
           // Use Money value object if available
       }
   }
   ```

   **Usage in View:**
   ```html
   <currency value="order.Total" currency="USD"></currency>
   <!-- Output: USD 99.99 -->
   ```

**Acceptance Criteria:**
- ✓ Unobtrusive validation works
- ✓ Add/Remove line items dynamically
- ✓ Line total and order total update in real-time
- ✓ Currency tag helper renders correctly
- ✓ Form binding works (ModelState.IsValid passes)

---

### **Section 4 — Testing with xUnit** (10 minutes)

**Requirement:**
Create `HON.Orders.Tests` project with unit tests for core logic.

**Test Classes & Methods:**

#### **MoneyTests** (3 tests)
```csharp
[Fact]
public void Constructor_WithValidAmount_CreatesInstance() { }

[Theory]
[InlineData(10, 5, 15)]
[InlineData(100, 25, 75)]
public void Add_TwoMoneyObjects_ReturnsCorrectSum(
    decimal amt1, decimal amt2, decimal expected) { }

[Fact]
public void Constructor_WithNegativeAmount_ThrowsException() { }
```

#### **OrderServiceTests** (3 tests)
```csharp
[Fact]
public void GetTopCustomersByRevenue_ReturnsTopFive() { }

[Fact]
public void StreamOrdersAsync_YieldsResultsInPages() { }

[Fact]
public void BuildFilter_WithStatus_CreatesCorrectExpression() { }
```

#### **ProductServiceTests** (2 tests)
```csharp
[Fact]
public void CreateProduct_WithValidData_SavesAndReturnsId() { }

[Fact]
public void UpdateProduct_WithConcurrencyConflict_ThrowsException() { }
```

**Test Pattern:**
- Use **AAA pattern** (Arrange, Act, Assert)
- Use in-memory database for EF Core tests
- Mock external dependencies if needed
- Use xUnit `[Theory]` for parameterized tests

**Acceptance Criteria:**
- ✓ At least 8 unit tests written
- ✓ Tests pass successfully
- ✓ AAA pattern followed
- ✓ In-memory DB used for integration tests
- ✓ Proper assertions (Assert.Equal, Assert.NotNull, etc.)

---

## Submission Requirements

### **Deliverables:**

1. **Solution File:** `HON.Orders.sln`
2. **Project Files:**
   - `HON.Orders.Web.csproj`
   - `HON.Orders.Data.csproj`
   - `HON.Orders.Domain.csproj`
   - `HON.Orders.Tests.csproj`

3. **README.md** with:
   - How to restore NuGet packages
   - How to run migrations
   - How to run tests
   - How to run the web app
   - Sample credentials for Admin login (if auth is implemented)

4. **Database:**
   - All migrations committed
   - Seed data included in migration or Initial context creation

5. **Code Quality:**
   - Proper naming conventions
   - Comments where logic is non-obvious
   - No compiler warnings

### **Submission Format:**

- **ZIP file:** `HON.Orders.zip`
- All source files included
- **Exclude:** `bin/`, `obj/`, `.vs/`, `node_modules/`

---

## Grading Rubric (100 points total)

### **Section 1: C# & LINQ (20 points)**
| Task | Points | Criteria |
|------|--------|----------|
| 1.1 Money VO | 5 | Immutability, operators, extension method |
| 1.2 LINQ | 5 | GroupBy, Join, OrderByDescending correct |
| 1.3 Async | 5 | Pagination, lazy yield, cancellation |
| 1.4 Expressions | 5 | Dynamic predicates, EF Core compatible |

### **Section 2: EF Core (20 points)**
| Task | Points | Criteria |
|------|--------|----------|
| 2.1 Fluent Config | 12 | All relationships, shadows, concurrency tokens |
| 2.2 Soft Delete | 8 | Query filters, admin override, migrations |

### **Section 3: ASP.NET Core MVC (40 points)**
| Task | Points | Criteria |
|------|--------|----------|
| 3.1 Layout & UX | 8 | Responsive, tag helpers, validation display |
| 3.2 Filters | 8 | ExecutionTime, AuthRoleCheck working |
| 3.3 Admin CRUD | 14 | All CRUD ops, PRG, antiforgery, TempData |
| 3.4 Client-Side | 10 | Validation, dynamic items, tag helper |

### **Section 4: Testing (10 points)**
| Task | Points | Criteria |
|------|--------|----------|
| xUnit Tests | 10 | 8+ tests, AAA pattern, in-memory DB |

### **Section 5: Code Quality & Submission (10 points)**
| Item | Points | Criteria |
|------|--------|----------|
| Naming & Structure | 5 | Clear conventions, proper organization |
| Documentation | 3 | README, inline comments |
| No Warnings | 2 | Clean build output |

---

## Time Allocation Recommendation

| Section | Time |
|---------|------|
| Section 1 (C# & LINQ) | 25 min |
| Section 2 (EF Core) | 20 min |
| Section 3 (MVC) | 35 min |
| Section 4 (Testing) | 10 min |
| **Total** | **90 min** |

---

## Frequently Asked Questions

### **Can I use ASP.NET Core Razor Pages instead of MVC?**
No. The assessment specifically requires **ASP.NET Core MVC** with Controllers and Views.

### **Can I use Entity Framework Core as Code-First?**
Yes. You can use Code-First migrations. Database-First is also acceptable if migrations are included.

### **Do I need to implement authentication/authorization?**
Not required for basic functionality, but the Admin Role Check filter assumes a User context. Implement basic claims-based auth or use a mock for testing.

### **Can I use third-party libraries like AutoMapper?**
Yes, but core logic must be implemented from scratch (Money VO, LINQ queries, filters).

### **What if I don't finish all tasks?**
Partial credit is awarded. Focus on quality over quantity.

### **Should I include a connection string in appsettings.json?**
Yes. Use LocalDB or SQL Server Express. Provide instructions in README.

---

## Resources

- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/)
- [xUnit.net](https://xunit.net/)
- [C# Language Features](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/)

---

## Good Luck! 🎯

Complete all sections to the best of your ability. Focus on clean, maintainable code and proper testing. Your solution will be evaluated on both correctness and code quality.
