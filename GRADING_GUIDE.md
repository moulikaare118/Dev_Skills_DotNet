# HON Orders Assessment — Grading Checklist & Assessor Guide

## Overview

This document provides:
1. **Detailed grading rubric** with point allocation
2. **Acceptance criteria** for each task
3. **Common issues** and how to score partial credit
4. **Quick evaluation checklist** for assessors

---

## Section 1: C# & LINQ (20 points)

### Task 1.1 — Money Value Object (5 points)

#### Acceptance Criteria Checklist

- [ ] **Immutability (1 pt)**
  - ✓ Properties are read-only (no setters)
  - ✓ Constructor takes parameters
  - ✓ No way to modify after creation

- [ ] **Constructors & Validation (1 pt)**
  - ✓ Constructor validates `Amount >= 0`
  - ✓ Throws `ArgumentException` or similar on invalid input
  - ✓ Currency defaults to "USD" if null

- [ ] **Arithmetic Operators (1.5 pts)**
  - ✓ `operator +` (addition)
  - ✓ `operator -` (subtraction)
  - ✓ `operator *` (multiplication, at least one direction)
  - ✓ Currency validation in operators (both operands must match)

- [ ] **Equality & ToString (1 pt)**
  - ✓ `Equals()` and `GetHashCode()` implemented
  - ✓ `ToString()` returns format like "USD 99.99"

- [ ] **Extension Method (0.5 pts)**
  - ✓ `FormatMoney()` extension on `decimal` type
  - ✓ Calls/delegates to Money value object
  - ✓ Returns formatted string

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 5/5 | All features implemented, immutability enforced, operators work correctly |
| 4/4 | Missing one operator or equality methods incomplete |
| 3/3 | Operators present but currency validation missing or incomplete |
| 2/2 | Basic structure present; extension method missing or incomplete |
| 1/1 | Only skeleton/partial implementation |
| 0/0 | Not attempted or does not compile |

#### Common Issues

- **Issue:** Constructor allows modification after creation  
  **Score:** 0 for immutability if properties have setters

- **Issue:** Operators don't validate currency match  
  **Score:** Deduct 0.5 points

- **Issue:** Extension method not present  
  **Score:** Deduct 0.5 points

- **Issue:** FormatMoney implemented but doesn't use Money class  
  **Score:** Deduct 0.25 points

---

### Task 1.2 — LINQ: Top 5 Customers by Revenue (5 points)

#### Acceptance Criteria Checklist

- [ ] **Date Filtering (1 pt)**
  - ✓ Filters orders from last N days (`DateTime.UtcNow.AddDays(-days)`)
  - ✓ Default is 30 days

- [ ] **GroupBy Implementation (1 pt)**
  - ✓ Groups by `Customer` (or `CustomerId` with join)
  - ✓ Correct grouping semantics

- [ ] **SelectMany or Navigation (1 pt)**
  - ✓ Accesses `OrderItems` collection
  - ✓ Either uses `SelectMany()` or navigation properties
  - ✓ Correctly sums line totals

- [ ] **Ordering & Limiting (1 pt)**
  - ✓ `OrderByDescending(x => x.Revenue)` or similar
  - ✓ `.Take(5)` or `.Take(topCount)`

- [ ] **Return DTO (1 pt)**
  - ✓ Returns `IEnumerable<TopCustomerDto>`
  - ✓ DTO contains: CustomerName, OrdersCount, Revenue
  - ✓ Unit tests verify correctness

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 5/5 | All LINQ operations work; correct top 5 customers returned |
| 4/4 | Date filtering or ordering slightly off |
| 3/3 | SelectMany/navigation working; grouping correct |
| 2/2 | Basic query present; revenue calculation incorrect |
| 1/1 | Partial implementation; query logic flawed |
| 0/0 | Not attempted or does not compile |

#### Common Issues

- **Issue:** Filters by created date instead of OrderDate  
  **Score:** Deduct 0.5 points

- **Issue:** Forgets to exclude soft-deleted orders  
  **Score:** Deduct 0.5 points

- **Issue:** Includes deleted customers in results  
  **Score:** Deduct 0.25 points

- **Issue:** Calculation includes tax or other fields not in LineTotal  
  **Score:** Acceptable if documented

---

### Task 1.3 — Async Streams (5 points)

#### Acceptance Criteria Checklist

- [ ] **Async Iterator Signature (1 pt)**
  - ✓ Returns `IAsyncEnumerable<Order>`
  - ✓ Takes `DateTime since` parameter
  - ✓ Takes optional `CancellationToken ct`

- [ ] **Pagination Implementation (2 pts)**
  - ✓ Uses `Skip()` and `Take()` for paging
  - ✓ Page size (e.g., 20 items per page)
  - ✓ Loops until no more results

- [ ] **Lazy Evaluation (1 pt)**
  - ✓ Uses `yield return` (not returning all at once)
  - ✓ `await foreach` works correctly in consumer code

- [ ] **Cancellation Support (0.5 pts)**
  - ✓ `CancellationToken` passed to `ToListAsync(ct)`
  - ✓ Cancellation stops iteration

- [ ] **Usage Example (0.5 pts)**
  - ✓ Example shows `await foreach` usage
  - ✓ Example is in test or documentation

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 5/5 | All requirements met; pagination + cancellation + lazy eval work |
| 4/4 | Missing cancellation token handling |
| 3/3 | Basic async enumeration; pagination incomplete |
| 2/2 | Async iterator present; not lazy or pagination broken |
| 1/1 | Skeleton only; compile errors |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** Returns `Task<IEnumerable<Order>>` instead of `IAsyncEnumerable<Order>`  
  **Score:** Deduct 1 point

- **Issue:** Loads all results at once (not lazy)  
  **Score:** Deduct 1 point

- **Issue:** No cancellation support  
  **Score:** Deduct 0.5 points

---

### Task 1.4 — Dynamic Predicates with Expression Trees (5 points)

#### Acceptance Criteria Checklist

- [ ] **Expression Composition (2 pts)**
  - ✓ Builds `Expression<Func<Order, bool>>` correctly
  - ✓ Composes conditions only for non-null parameters
  - ✓ Uses `&&` (AND) logic to combine predicates

- [ ] **Supported Filters (2 pts)**
  - ✓ Status filter (string or enum)
  - ✓ Date range (fromDate, toDate)
  - ✓ Minimum total (minTotal >= X)
  - ✓ Customer email (case-insensitive contains)

- [ ] **EF Core Compatibility (1 pt)**
  - ✓ Query translates to SQL (no client-side evaluation)
  - ✓ No `AsEnumerable()` before filtering
  - ✓ Tested with EF Core (integration test)

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 5/5 | All 4 filters work; EF Core translates to SQL correctly |
| 4/4 | 3 of 4 filters working; no EF translation issue |
| 3/3 | 2-3 filters working; some EF issues |
| 2/2 | Basic expression composition; missing multiple filters |
| 1/1 | Partial implementation; compile errors |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** Uses `AsEnumerable()` before filter (breaks EF Core translation)  
  **Score:** Deduct 1 point

- **Issue:** String comparison case-sensitive when it should be case-insensitive  
  **Score:** Deduct 0.25 points

- **Issue:** Missing one or more filter options  
  **Score:** Deduct 0.5 points per missing filter

---

## Section 2: Entity Framework Core (20 points)

### Task 2.1 — Fluent Configuration & Concurrency (12 points)

#### Acceptance Criteria Checklist

- [ ] **Relationships (4 pts)**
  - ✓ Customer → Orders (1-to-Many, CascadeDelete)
  - ✓ Order → OrderItems (1-to-Many)
  - ✓ Order → Payments (1-to-Many)
  - ✓ Product → OrderItems (1-to-Many)
  - ✓ All navigation properties bidirectional

- [ ] **Property Configuration (3 pts)**
  - ✓ Product.UnitPrice → `HasPrecision(18, 2)`
  - ✓ Order.OrderNumber → unique index
  - ✓ Customer.Email → unique index
  - ✓ String lengths configured (Name, Sku, etc.)

- [ ] **Shadow Properties (2 pts)**
  - ✓ CreatedAt (DateTime)
  - ✓ LastModifiedAt (DateTime)
  - ✓ Applied to: Customer, Product, Order, OrderItem, Payment
  - ✓ Set via Fluent API (not model properties)

- [ ] **Concurrency Control (2 pts)**
  - ✓ Product.RowVersion → `IsRowVersion()`
  - ✓ Order.RowVersion → `IsRowVersion()`
  - ✓ Generates correct SQL (SQL Server `rowversion` type)

- [ ] **Seed Data (1 pt)**
  - ✓ At least 3 customers
  - ✓ At least 5 products
  - ✓ At least 3 orders with line items

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 12/12 | All configs correct; migrations apply cleanly |
| 10/10 | Missing seed data or one config incomplete |
| 8/8 | Relationships present; shadows or concurrency incomplete |
| 6/6 | Basic structure; multiple configs missing |
| 4/4 | Partial implementation; migrations may need revision |
| 2/2 | Skeleton only; compile/migration errors |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** Shadow properties are model properties (not shadow)  
  **Score:** Deduct 1 point

- **Issue:** RowVersion not configured or wrong type  
  **Score:** Deduct 1 point

- **Issue:** Unique constraints missing on OrderNumber/Email  
  **Score:** Deduct 0.5 points

- **Issue:** Foreign key relationships not configured  
  **Score:** Deduct 2 points

---

### Task 2.2 — Soft Delete & Query Filters (8 points)

#### Acceptance Criteria Checklist

- [ ] **Query Filters Configured (3 pts)**
  - ✓ Global filter on Customer: `!c.IsDeleted`
  - ✓ Global filter on Product: `!p.IsDeleted`
  - ✓ Global filter on Order: `!o.IsDeleted`
  - ✓ Global filter on OrderItem: `!oi.IsDeleted`
  - ✓ Global filter on Payment: `!pa.IsDeleted`

- [ ] **Admin Override Method (2 pts)**
  - ✓ `IncludeDeleted<T>()` or similar method exists
  - ✓ Uses `IgnoreQueryFilters()` to bypass filters
  - ✓ Method is accessible in controllers

- [ ] **Admin Views Use Override (2 pts)**
  - ✓ Admin Product list calls `IncludeDeleted<Product>()`
  - ✓ Shows deleted and active products
  - ✓ Regular users only see active products

- [ ] **Migration & Testing (1 pt)**
  - ✓ `IsDeleted` column added in migration
  - ✓ Unit tests verify filtering works
  - ✓ Tests verify `IgnoreQueryFilters()` bypasses

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 8/8 | All entities have filters; admin override works perfectly |
| 6/6 | Query filters present; admin override incomplete |
| 4/4 | Filters present but not applied consistently |
| 3/3 | Partial implementation; some entities missing filters |
| 2/2 | Basic structure; functionality incomplete |
| 1/1 | Skeleton only |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** Query filters only on one or two entities  
  **Score:** Deduct 1-2 points depending on scope

- **Issue:** `IgnoreQueryFilters()` not used or not working  
  **Score:** Deduct 2 points

- **Issue:** Admin views still show only active records  
  **Score:** Deduct 2 points

- **Issue:** No migration for `IsDeleted` column  
  **Score:** Deduct 1 point

---

## Section 3: ASP.NET Core MVC (40 points)

### Task 3.1 — UX & Layout (8 points)

#### Acceptance Criteria Checklist

- [ ] **_Layout.cshtml Structure (2 pts)**
  - ✓ Navigation bar with links (Home, Catalog, Orders, Admin)
  - ✓ Footer with copyright
  - ✓ Main `@RenderBody()` placeholder
  - ✓ CSS/JS properly linked

- [ ] **Bootstrap Styling (2 pts)**
  - ✓ Responsive layout (mobile-friendly)
  - ✓ Bootstrap 5 (or similar framework)
  - ✓ Navigation bar responsive (hamburger menu on mobile)
  - ✓ Tables/forms properly styled

- [ ] **Partial Views (2 pts)**
  - ✓ `_ValidationSummary.cshtml` for errors
  - ✓ `_SummaryCard.cshtml` for dashboard widgets
  - ✓ Both partials render correctly

- [ ] **View Components (1 pt)**
  - ✓ `OrderSummary` view component exists
  - ✓ Displays recent orders
  - ✓ Shows OrderNumber, CustomerName, Total, Status

- [ ] **Tag Helpers & Validation (1 pt)**
  - ✓ Uses `asp-for`, `asp-action`, `asp-controller`
  - ✓ Validation messages display correctly
  - ✓ No raw HTML (proper tag helper usage)

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 8/8 | Clean, responsive layout with all components |
| 7/7 | Minor styling issues; all components present |
| 6/6 | Layout functional; one component missing or incomplete |
| 5/5 | Basic layout; missing partials or components |
| 3/3 | Layout exists; limited styling or components |
| 2/2 | Skeleton only |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** Layout not responsive or mobile-broken  
  **Score:** Deduct 1 point

- **Issue:** View components not implemented  
  **Score:** Deduct 1 point

- **Issue:** Validation messages don't display  
  **Score:** Deduct 1 point

---

### Task 3.2 — Filters (8 points)

#### Acceptance Criteria Checklist

- [ ] **ExecutionTimeFilter (4 pts)**
  - ✓ Derives from `ActionFilterAttribute`
  - ✓ `OnActionExecuting()` starts timer (Stopwatch)
  - ✓ `OnActionExecuted()` calculates elapsed time
  - ✓ Adds `Server-Timing` response header
  - ✓ Logs to console or trace
  - ✓ Can be applied to controllers/actions

- [ ] **AdminRoleCheckFilter (4 pts)**
  - ✓ Implements `IAuthorizationFilter`
  - ✓ Checks User claims for "Admin" role
  - ✓ Returns 403 Forbidden if not authorized
  - ✓ Applied to Admin area controllers
  - ✓ Does not break non-admin functionality

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 8/8 | Both filters implemented and working correctly |
| 7/7 | One filter works perfectly; other incomplete |
| 6/6 | Both filters present; one not fully working |
| 4/4 | ExecutionTimeFilter working; role check incomplete |
| 3/3 | Basic filter structure; implementation incomplete |
| 2/2 | Skeleton only |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** Filter not applied to any controllers  
  **Score:** Deduct 2 points

- **Issue:** Role check doesn't return 403  
  **Score:** Deduct 1 point

- **Issue:** Server-Timing header not added  
  **Score:** Deduct 1 point

---

### Task 3.3 — Admin Area CRUD (14 points)

#### Acceptance Criteria Checklist

- [ ] **Admin Area Structure (1 pt)**
  - ✓ `Areas/Admin/` folder created
  - ✓ `Areas/Admin/Controllers/ProductController.cs`
  - ✓ `Areas/Admin/Views/Product/` views
  - ✓ Area routing configured in Program.cs

- [ ] **ProductController Actions (6 pts)**
  - ✓ `Index` (GET): Lists products with pagination
  - ✓ `Create` (GET): Shows form
  - ✓ `Create` (POST): Saves product, returns 201 or redirects
  - ✓ `Edit` (GET): Shows edit form
  - ✓ `Edit` (POST): Updates product
  - ✓ `Delete` (GET/POST): Soft-deletes product

- [ ] **View Templates (3 pts)**
  - ✓ Index.cshtml: Table with product list
  - ✓ Create.cshtml: Form with all fields
  - ✓ Edit.cshtml: Pre-populated form
  - ✓ Delete.cshtml: Confirmation prompt

- [ ] **Antiforgery Protection (1.5 pts)**
  - ✓ `@Html.AntiForgeryToken()` on all POST forms
  - ✓ `[ValidateAntiForgeryToken]` on POST actions
  - ✓ No antiforgery errors

- [ ] **TempData & PRG Pattern (2 pts)**
  - ✓ POST creates TempData message (success/error)
  - ✓ Redirects after POST (PRG pattern)
  - ✓ Success message displays after redirect
  - ✓ Error messages display on form

- [ ] **Server-Side Validation (0.5 pts)**
  - ✓ `ModelState.IsValid` checked
  - ✓ Validation errors shown in view

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 14/14 | All CRUD operations work; antiforgery + TempData working |
| 12/12 | Missing one action or antiforgery incomplete |
| 10/10 | Basic CRUD; TempData or pagination incomplete |
| 8/8 | 4-5 actions working; views incomplete |
| 6/6 | Partial implementation; multiple issues |
| 3/3 | Skeleton only |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** No antiforgery token on forms  
  **Score:** Deduct 2 points

- **Issue:** POST doesn't redirect (no PRG)  
  **Score:** Deduct 1 point

- **Issue:** Delete doesn't soft-delete (hard-delete)  
  **Score:** Deduct 1 point (acceptable if documented)

- **Issue:** Pagination missing  
  **Score:** Deduct 1 point

---

### Task 3.4 — Client-Side Behavior & Tag Helper (10 points)

#### Acceptance Criteria Checklist

- [ ] **Unobtrusive Validation (3 pts)**
  - ✓ jQuery Validation included
  - ✓ Validation attributes on inputs
  - ✓ Errors display on blur/change
  - ✓ Submit button behavior correct
  - ✓ No page reloads on validation error

- [ ] **Dynamic Line Items (4 pts)**
  - ✓ Order form allows adding line items
  - ✓ Each item has: ProductId (dropdown), Quantity (number)
  - ✓ "Add Item" button adds row dynamically
  - ✓ "Remove Item" button removes row
  - ✓ Unique row indices maintained
  - ✓ Form binding works (ModelState.IsValid passes)

- [ ] **Real-Time Calculations (2 pts)**
  - ✓ Line total updates (Quantity × UnitPrice)
  - ✓ Order total updates (sum of line totals)
  - ✓ Currency formatting applied

- [ ] **Custom Tag Helper (1 pt)**
  - ✓ `CurrencyFormatterTagHelper` created
  - ✓ Renders as `<currency value="99.99" currency="USD"></currency>`
  - ✓ Outputs formatted string (e.g., "USD 99.99")
  - ✓ Uses Money value object (if available)

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 10/10 | All features working; UO validation + dynamic items + tag helper |
| 9/9 | Missing currency formatting or tag helper incomplete |
| 8/8 | Validation + dynamic items working; calculations incomplete |
| 6/6 | Dynamic items present; validation or calculations missing |
| 4/4 | Partial implementation; multiple issues |
| 2/2 | Basic form; no dynamic behavior |
| 0/0 | Not attempted |

#### Common Issues

- **Issue:** No client-side validation  
  **Score:** Deduct 2 points

- **Issue:** Add/Remove buttons don't work  
  **Score:** Deduct 2 points

- **Issue:** Form binding broken (ModelState invalid)  
  **Score:** Deduct 1 point

- **Issue:** Tag helper not implemented  
  **Score:** Deduct 1 point

---

## Section 4: Testing with xUnit (10 points)

#### Acceptance Criteria Checklist

- [ ] **Test Count (1 pt)**
  - ✓ At least 8 unit tests written
  - ✓ Tests compile and run without errors

- [ ] **Money Tests (2 pts)**
  - ✓ Constructor validation test (e.g., negative amount throws)
  - ✓ Arithmetic operator tests (addition, subtraction, etc.)
  - ✓ Equality / ToString tests

- [ ] **OrderService Tests (3 pts)**
  - ✓ `GetTopCustomersByRevenue` returns correct top 5
  - ✓ `StreamOrdersAsync` pages results correctly
  - ✓ `BuildFilter` creates correct expressions

- [ ] **Product/Domain Tests (2 pts)**
  - ✓ Create/Update operations work correctly
  - ✓ Concurrency conflict detection (RowVersion)

- [ ] **Test Quality (2 pts)**
  - ✓ AAA pattern (Arrange, Act, Assert) followed
  - ✓ Descriptive test names
  - ✓ In-memory DbContext for integration tests
  - ✓ Proper assertions (Assert.Equal, Assert.Throws, etc.)
  - ✓ All tests pass

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 10/10 | 8+ tests; all pass; AAA pattern; good coverage |
| 9/9 | 8 tests; one or two failures or quality issues |
| 8/8 | 7-8 tests; partial AAA adherence |
| 6/6 | 5-6 tests; some pass; quality issues |
| 4/4 | 3-4 tests; multiple failures |
| 2/2 | Tests present but largely non-functional |
| 0/0 | No tests or project missing |

#### Common Issues

- **Issue:** Tests don't follow AAA pattern  
  **Score:** Deduct 1 point

- **Issue:** Tests use real database instead of in-memory  
  **Score:** Deduct 0.5 points

- **Issue:** Test names unclear or unhelpful  
  **Score:** Deduct 0.25 points

---

## Section 5: Code Quality & Submission (10 points)

#### Acceptance Criteria Checklist

- [ ] **Naming Conventions (3 pts)**
  - ✓ Classes: PascalCase
  - ✓ Methods: PascalCase
  - ✓ Variables: camelCase
  - ✓ Constants: UPPER_CASE or PascalCase
  - ✓ Namespace: `HON.Orders.*`

- [ ] **Project Organization (3 pts)**
  - ✓ Entities in Domain/Entities/
  - ✓ Services in Domain/Services/
  - ✓ Controllers organized by area
  - ✓ Views in correct folders
  - ✓ Tests in Tests project

- [ ] **Documentation (2 pts)**
  - ✓ README.md with setup instructions
  - ✓ How to restore NuGet packages
  - ✓ How to run migrations
  - ✓ How to run tests
  - ✓ How to run web app
  - ✓ Comments on non-obvious logic

- [ ] **Build Quality (2 pts)**
  - ✓ Solution builds without errors
  - ✓ No compiler warnings (or minimal)
  - ✓ No runtime exceptions on startup
  - ✓ `.gitignore` excludes bin/obj/.vs/

#### Scoring Guide

| Points | Criteria |
|--------|----------|
| 10/10 | Clean code; organized; good documentation; no warnings |
| 9/9 | Minor naming or organization issues |
| 8/8 | Some inconsistencies; documentation incomplete |
| 6/6 | Multiple issues; basic structure present |
| 4/4 | Poorly organized; lacks documentation |
| 2/2 | Minimal effort on organization/documentation |
| 0/0 | Missing or not attempted |

#### Common Issues

- **Issue:** Mixed naming conventions (camelCase for classes)  
  **Score:** Deduct 0.5 points

- **Issue:** Files in wrong folders  
  **Score:** Deduct 1 point

- **Issue:** README missing or incomplete  
  **Score:** Deduct 1 point

- **Issue:** Compiler warnings present  
  **Score:** Deduct 0.5 points

---

## Total Score Calculation

**Total = Section 1 + Section 2 + Section 3 + Section 4 + Section 5**

| Score | Grade | Interpretation |
|-------|-------|-----------------|
| 90–100 | A | Excellent: Professional quality, all requirements met |
| 80–89 | B | Good: Most requirements met, minor issues |
| 70–79 | C | Satisfactory: Core requirements met, notable gaps |
| 60–69 | D | Passing: Basic functionality; significant issues |
| Below 60 | F | Failing: Incomplete or non-functional |

---

## Assessment Notes Template

```markdown
## Evaluation Form

**Candidate Name:** ________________  
**Date:** ________________  
**Total Score:** ___/100

### Section Scores
- C# & LINQ: ___/20
- Entity Framework Core: ___/20
- ASP.NET Core MVC: ___/40
- Testing: ___/10
- Code Quality: ___/10

### Strengths
- [List notable implementations]

### Areas for Improvement
- [List incomplete or weak areas]

### Detailed Comments
[Assessor notes]

### Recommendations
- [ ] Pass
- [ ] Borderline (retest certain areas)
- [ ] Fail
```

---

## Quick Evaluation Checklist

Use this checklist for rapid assessment:

**C# & LINQ (20 pts)**
- [ ] Money VO: immutable, operators, extension method
- [ ] Top 5 customers: GroupBy, SelectMany, correct revenue
- [ ] Async streams: IAsyncEnumerable, pagination, cancellation
- [ ] Filter builder: Expression trees, EF Core compatible

**EF Core (20 pts)**
- [ ] Fluent config: relationships, precision, shadow props
- [ ] Concurrency tokens: RowVersion on Product & Order
- [ ] Soft delete: Query filters, admin override, IgnoreQueryFilters()

**MVC (40 pts)**
- [ ] Layout: responsive, nav bar, footer, tag helpers
- [ ] Filters: ExecutionTime (Server-Timing), AdminRoleCheck
- [ ] Admin CRUD: all 6 actions, antiforgery, TempData, PRG
- [ ] Client-side: UO validation, dynamic line items, tag helper

**Testing (10 pts)**
- [ ] At least 8 tests
- [ ] AAA pattern
- [ ] Tests pass
- [ ] In-memory DB for integration tests

**Quality (10 pts)**
- [ ] No build warnings
- [ ] README.md present
- [ ] Proper naming conventions
- [ ] Organized folder structure

---

## Passing the Assessment

**Minimum Requirements (60+ points):**
1. All entities exist with required fields
2. At least 3 major features working (Money, Top 5 customers, Admin CRUD)
3. Database migrations work
4. Tests present and mostly passing
5. No major compilation errors

**Excellence (90+ points):**
1. All tasks completed with quality implementation
2. Proper error handling and edge cases considered
3. Clean, maintainable code
4. Comprehensive testing
5. Professional layout and UX

---

End of Grading Guide.
