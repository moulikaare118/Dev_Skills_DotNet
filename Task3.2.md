# Task 3.2 — Execution Timing and Admin Authorization Filters

Solution files:
- `HON.Orders.Web/Filters/ExecutionTimingFilter.cs`
- `HON.Orders.Web/Filters/AdminRoleFilter.cs`

Implementation details:
- `ExecutionTimingFilter` records action start time and sets a `Server-Timing` header.
- `AdminRoleFilter` enforces that an authenticated user must be in the `Admin` role.
- Filters are registered in `HON.Orders.Web/Program.cs`.
