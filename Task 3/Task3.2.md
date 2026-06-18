# Task 3.2 — Execution Timing and Admin Authorization Filters

Solution files:
- `HON.Orders.Web/Filters/ExecutionTimingFilter.cs`
- `HON.Orders.Web/Filters/AdminRoleFilter.cs`

Implementation details:
- `ExecutionTimingFilter` measures action duration and adds `Server-Timing` header.
- `AdminRoleFilter` checks authentication and admin role membership.
- Filters are registered in `HON.Orders.Web/Program.cs`.
