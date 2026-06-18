# Task 1.1 — Money Value Object and Decimal Extension

Solution files:
- `HON.Orders.Domain/ValueObjects/Money.cs`
- `HON.Orders.Domain/Extensions/DecimalMoneyExtensions.cs`

Implementation details:
- `Money` is immutable with read-only `Amount` and `Currency`.
- `Money.Format()` returns culture-invariant formatted currency.
- Supports `+`, `-`, `*`, `/` operators with currency validation.
- Implements `IEquatable<Money>` and equality operators.
- `DecimalMoneyExtensions.FormatMoney` converts a decimal to `Money`.
