# HON Orders Assessment — Starter Project

This is a **starter project structure** for the HON Orders 90-minute .NET practical assessment.

## Quick Start

### 1. Prerequisites

- .NET 8.0 SDK or later
- SQL Server (LocalDB or Express)
- Git

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Configure Database

Edit `HON.Orders.Web/appsettings.json` and update the connection string if needed:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HonOrders;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

### 4. Create Migrations

```bash
cd HON.Orders.Data
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5. Run Tests

```bash
cd ../HON.Orders.Tests
dotnet test
```

### 6. Run Web Application

```bash
cd ../HON.Orders.Web
dotnet run
```

Navigate to `https://localhost:5001`

---

## Project Structure

### **HON.Orders.Domain** (Class Library)
- **Entities/**: All domain entities (Customer, Product, Order, etc.)
- **ValueObjects/**: Money value object
- **DTOs/**: Data transfer objects (TopCustomerDto, ProductViewModel)
- **Services/**: Business logic (OrderService)
- **Filters/**: Expression tree builders (OrderFilterBuilder)

### **HON.Orders.Data** (Class Library)
- **AppDbContext.cs**: Entity Framework Core DbContext
- **IHasSoftDelete.cs**: Interface for soft-delete entities
- **Migrations/**: EF Core migrations

### **HON.Orders.Web** (ASP.NET Core MVC)
- **Controllers/**: MVC controllers (Home, Catalog, Order, Product)
- **Areas/Admin/**: Admin area with product CRUD
- **Views/**: Razor views and layouts
- **Filters/**: Action and authorization filters
- **TagHelpers/**: Custom tag helpers
- **wwwroot/**: Static files (CSS, JS)

### **HON.Orders.Tests** (xUnit)
- **MoneyTests.cs**: Unit tests for Money value object
- **OrderServiceTests.cs**: Unit tests for OrderService
- **DbContextTests.cs**: Integration tests for AppDbContext

---

## TODO Items

The starter project contains **TODO** comments throughout the codebase to guide implementation:

### Priority 1 (Core)
- [ ] Implement Money value object (ValueObjects/Money.cs)
- [ ] Configure AppDbContext with Fluent API (AppDbContext.cs)
- [ ] Implement OrderService LINQ queries (Services/OrderService.cs)
- [ ] Create Admin ProductController CRUD (Areas/Admin/Controllers/ProductController.cs)

### Priority 2 (Important)
- [ ] Implement filters (ExecutionTimeFilter, AdminRoleCheck)
- [ ] Configure soft delete query filters
- [ ] Implement dynamic order line items (JavaScript)
- [ ] Create unit tests

### Priority 3 (Nice-to-Have)
- [ ] Add validation messages display
- [ ] Implement view components
- [ ] Add pagination
- [ ] Advanced styling

---

## Common Commands

### Migrations

```bash
# Add a new migration
dotnet ef migrations add YourMigrationName -p HON.Orders.Data

# Update database
dotnet ef database update -p HON.Orders.Data

# Drop database
dotnet ef database drop -p HON.Orders.Data
```

### Testing

```bash
# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "MoneyTests"

# Run with verbose output
dotnet test --verbosity detailed
```

### Build & Run

```bash
# Build solution
dotnet build

# Run web app
dotnet run --project HON.Orders.Web
```

---

## Assessment Guidelines

Refer to these documents for detailed requirements:

- **ASSESSMENT_SPECIFICATION.md** — Full requirements and acceptance criteria
- **QUICK_START_GUIDE.md** — Implementation tips and best practices
- **SOLUTION_TEMPLATE.md** — Expected code patterns and examples
- **GRADING_GUIDE.md** — How the solution will be evaluated
- **CANDIDATE_CHECKLIST.md** — Progress tracking checklist

---

## Notes

- All project files have **TODO comments** to guide implementation
- Use **in-memory database** for integration tests
- Follow **AAA pattern** (Arrange, Act, Assert) in tests
- Use **Fluent API** for EF Core configuration
- Implement **soft delete** for data preservation
- Add **validation** on both client and server side

---

## Good Luck! 🚀

This starter project provides the foundation. Follow the TODO comments and the assessment specification to complete the implementation.
