# Starter Project Structure — File Manifest

## Summary

A complete **starter project structure** for the HON Orders assessment has been created with:

- ✅ 4 project files (.csproj) with proper dependencies
- ✅ 6 domain entities with complete specifications
- ✅ Money value object skeleton
- ✅ Service layer with OrderService
- ✅ Filter builders and expression trees
- ✅ AppDbContext with Fluent API setup
- ✅ 3 MVC controllers (Home, Catalog, Order)
- ✅ Admin area with ProductController
- ✅ Custom filters (ExecutionTime, AdminRoleCheck)
- ✅ Tag helpers (CurrencyFormatter)
- ✅ Views and layouts (Bootstrap responsive)
- ✅ Unit test templates (xUnit)
- ✅ CSS and JavaScript stubs

---

## Project Directory Structure

```
HON.Orders/
├── HON.Orders.sln                    (Solution file)
├── README.md                         (Project README)
├── .gitignore                        (Git ignore file)
│
├── HON.Orders.Domain/
│   ├── HON.Orders.Domain.csproj
│   ├── Entities/
│   │   ├── IHasSoftDelete.cs         (Soft delete interface)
│   │   ├── Enums.cs                  (OrderStatus, PaymentMethod)
│   │   ├── Customer.cs               (Entity)
│   │   ├── Product.cs                (Entity with concurrency)
│   │   ├── Order.cs                  (Entity with concurrency)
│   │   ├── OrderItem.cs              (Entity)
│   │   ├── Payment.cs                (Entity)
│   │   └── AuditLog.cs               (Audit entity)
│   ├── ValueObjects/
│   │   └── Money.cs                  (Immutable Money VO + extension)
│   ├── DTOs/
│   │   ├── TopCustomerDto.cs         (DTO for top customers)
│   │   └── ProductViewModel.cs       (View model for products)
│   ├── Services/
│   │   └── OrderService.cs           (Service with LINQ + async streams)
│   └── Filters/
│       └── OrderFilterBuilder.cs     (Dynamic expression trees)
│
├── HON.Orders.Data/
│   ├── HON.Orders.Data.csproj        (EF Core packages)
│   └── AppDbContext.cs               (DbContext with Fluent API)
│
├── HON.Orders.Web/
│   ├── HON.Orders.Web.csproj         (MVC project)
│   ├── Program.cs                    (DI setup + middleware)
│   ├── appsettings.json              (Database connection)
│   ├── appsettings.Development.json  (Development settings)
│   │
│   ├── Controllers/
│   │   ├── HomeController.cs         (Dashboard)
│   │   ├── CatalogController.cs      (Product browsing)
│   │   └── OrderController.cs        (Order management)
│   │
│   ├── Areas/Admin/
│   │   ├── Controllers/
│   │   │   └── ProductController.cs  (Admin CRUD)
│   │   └── Views/
│   │       ├── _ViewImports.cshtml
│   │       └── Product/
│   │           ├── Index.cshtml      (Product list)
│   │           └── Create.cshtml     (Create form)
│   │
│   ├── Filters/
│   │   ├── ExecutionTimeFilterAttribute.cs    (Execution timing)
│   │   └── AdminRoleCheckAttribute.cs         (Authorization)
│   │
│   ├── TagHelpers/
│   │   └── CurrencyFormatterTagHelper.cs      (Currency formatting)
│   │
│   ├── Views/
│   │   ├── _ViewImports.cshtml       (Tag helper imports)
│   │   ├── Shared/
│   │   │   └── _Layout.cshtml        (Main layout)
│   │   └── Home/
│   │       └── Index.cshtml          (Dashboard)
│   │
│   └── wwwroot/
│       ├── css/
│       │   └── site.css              (Main styles)
│       └── js/
│           └── site.js               (Main script)
│
├── HON.Orders.Tests/
│   ├── HON.Orders.Tests.csproj       (xUnit + in-memory DB)
│   ├── MoneyTests.cs                 (Money VO tests)
│   ├── OrderServiceTests.cs          (OrderService tests)
│   └── DbContextTests.cs             (DbContext tests)
```

---

## Key Features of Starter Project

### ✅ Complete Entity Model
- All 6 entities defined with proper relationships
- IHasSoftDelete interface for soft delete support
- Enums for OrderStatus and PaymentMethod
- Navigation properties configured

### ✅ Domain Layer
- Money immutable value object skeleton
- OrderService with LINQ query stubs
- Dynamic filter builder with expression trees
- DTOs for data transfer

### ✅ Data Layer
- AppDbContext ready for Fluent API configuration
- Shadow properties (CreatedAt, LastModifiedAt) setup
- Query filter scaffolding for soft delete
- IncludeDeleted() method for admin access

### ✅ Web Layer
- 3 main controllers (Home, Catalog, Order)
- Admin area with ProductController CRUD skeleton
- Responsive Bootstrap layout
- Custom filters (ExecutionTime, AdminRoleCheck)
- Custom tag helper (CurrencyFormatter)
- Forms with validation readiness

### ✅ Testing Infrastructure
- xUnit project with in-memory DB setup
- Test templates following AAA pattern
- Money, OrderService, and DbContext test stubs

### ✅ Documentation
- README with quick start guide
- TODO comments throughout for guidance
- .gitignore for Visual Studio projects

---

## TODO Comments Guide

The starter project contains **strategic TODO comments** to guide implementation:

### High Priority (Core Assessment)
```csharp
// TODO: Validate amount >= 0
// TODO: Implement +, -, *, / operators
// TODO: Implement LINQ query (GroupBy, SelectMany, OrderByDescending)
// TODO: Configure DbContext with Fluent API
// TODO: Configure concurrency tokens (RowVersion)
// TODO: Implement soft delete query filters
```

### Medium Priority (MVC & Controllers)
```csharp
// TODO: Add @Html.AntiForgeryToken()
// TODO: Implement PRG pattern (Post/Redirect/Get)
// TODO: Start stopwatch for ExecutionTimeFilter
// TODO: Add Server-Timing response header
// TODO: Check User.HasClaim("role", "Admin")
```

### Lower Priority (Enhancement)
```csharp
// TODO: Add pagination
// TODO: Add dynamic line item functionality
// TODO: Add view components
// TODO: Add seed data
```

---

## Project Dependencies

### HON.Orders.Domain
- No external dependencies
- Pure C# domain models

### HON.Orders.Data
- Microsoft.EntityFrameworkCore.SqlServer (v8.0.0)
- Microsoft.EntityFrameworkCore.Design (v8.0.0)

### HON.Orders.Web
- Microsoft.EntityFrameworkCore.SqlServer (v8.0.0)
- Built-in ASP.NET Core packages

### HON.Orders.Tests
- xunit (v2.6.6)
- xunit.runner.visualstudio (v2.5.6)
- Microsoft.NET.Test.Sdk (v17.8.2)
- Microsoft.EntityFrameworkCore.InMemory (v8.0.0)

---

## Next Steps for Candidates

1. **Extract** the starter project to your working directory
2. **Read** the README.md and follow the Quick Start
3. **Review** ASSESSMENT_SPECIFICATION.md for full requirements
4. **Follow** TODO comments throughout the codebase
5. **Implement** features section by section
6. **Test** frequently using the test project
7. **Submit** the completed solution as a ZIP file

---

## Assessment Support Files

All supporting documentation is located in the parent directory:

- `ASSESSMENT_SPECIFICATION.md` — Full 90-minute assessment spec
- `QUICK_START_GUIDE.md` — Implementation quick reference
- `SOLUTION_TEMPLATE.md` — Expected code patterns
- `GRADING_GUIDE.md` — Evaluation criteria
- `CANDIDATE_CHECKLIST.md` — Progress tracker
- `DOCUMENTATION_INDEX.md` — Navigation guide

---

## Building & Running

### Restore Packages
```bash
cd HON.Orders
dotnet restore
```

### Create Database
```bash
cd HON.Orders.Data
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Run Tests
```bash
cd ../HON.Orders.Tests
dotnet test
```

### Run Web Application
```bash
cd ../HON.Orders.Web
dotnet run
# Navigate to https://localhost:5001
```

---

## File Count Summary

| Component | Files | Type |
|-----------|-------|------|
| Solution & Config | 3 | .sln, .csproj, .gitignore |
| Domain Entities | 9 | .cs classes |
| Domain Services | 2 | .cs classes |
| Data Layer | 1 | .cs class |
| Controllers | 4 | .cs classes |
| Filters & Helpers | 3 | .cs classes |
| Views | 4 | .cshtml files |
| Tests | 3 | .cs test classes |
| Static Files | 2 | .css, .js |
| Config Files | 2 | .json files |
| Documentation | 1 | README.md |
| **TOTAL** | **37** | **Project files** |

---

## Quality Checklist

- ✅ All projects reference each other correctly
- ✅ Package dependencies configured
- ✅ Entity relationships mapped
- ✅ Shadow properties ready
- ✅ Controllers with action stubs
- ✅ Views with Bootstrap responsive layout
- ✅ Filters and tag helpers skeleton
- ✅ Test project with AAA pattern templates
- ✅ Database config ready
- ✅ Static files (CSS, JS) prepared
- ✅ TODO comments for guidance
- ✅ .gitignore configured
- ✅ README with instructions

---

**Ready for Assessment! 🚀**

This starter project provides a solid foundation. Candidates can follow the TODO comments and assessment specification to implement the remaining features within the 90-minute timeframe.
