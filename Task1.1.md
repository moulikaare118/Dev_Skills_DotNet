# Task 1.1 — Money Value Object and Decimal Extension

Solution files:
- `HON.Orders.Domain/ValueObjects/Money.cs`
- `HON.Orders.Domain/Extensions/DecimalMoneyExtensions.cs`

Implementation details:
- `Money` is immutable with read-only `Amount` and `Currency` properties.
- `Money.Format()` returns culture-invariant formatted currency.
- Arithmetic operators `+`, `-`, `*`, and `/` are implemented.
- Equality operators and `IEquatable<Money>` support value comparison.
- `DecimalMoneyExtensions.FormatMoney` converts a decimal into a `Money` object.
