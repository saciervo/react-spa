---
name: servicestack-validation
description: Applies declarative validation attributes and FluentValidation to ServiceStack Request DTOs.
---

# ServiceStack Validation

ServiceStack provides two validation approaches: **Declarative Validation** (attributes) and **FluentValidation** (code-based). Declarative Validation is the recommended primary approach.

> **Note**: `ValidationFeature` is pre-registered by default — no manual plugin registration required.

## Declarative Validation (Recommended)

Apply `[Validate*]` attributes directly on Request DTO properties for simple, declarative rules:

### Property Validators

```csharp
public class CreateBooking : ICreateDb<Booking>, IReturn<IdResponse>
{
    [ValidateNotEmpty]
    public string Name { get; set; }

    [ValidateGreaterThan(0)]
    public decimal Cost { get; set; }

    [ValidateEmail]
    public string Email { get; set; }

    [ValidateInclusiveBetween(1, 5)]
    public int Rating { get; set; }

    [ValidateMinimumLength(10)]
    public string Description { get; set; }
}
```

### Available Property Attributes

| Attribute | Description |
|---|---|
| `[ValidateNotEmpty]` | Must not be empty/null |
| `[ValidateNotNull]` | Must not be null |
| `[ValidateEmail]` | Valid email format |
| `[ValidateCreditCard]` | Valid credit card number |
| `[ValidateEmpty]` | Must be empty |
| `[ValidateEqual(value)]` | Must equal value |
| `[ValidateNotEqual(value)]` | Must not equal value |
| `[ValidateGreaterThan(n)]` | Must be > n |
| `[ValidateGreaterThanOrEqual(n)]` | Must be >= n |
| `[ValidateLessThan(n)]` | Must be < n |
| `[ValidateLessThanOrEqual(n)]` | Must be <= n |
| `[ValidateInclusiveBetween(a, b)]` | Must be between a and b (inclusive) |
| `[ValidateExclusiveBetween(a, b)]` | Must be between a and b (exclusive) |
| `[ValidateExactLength(n)]` | Must be exactly n characters |
| `[ValidateMinimumLength(n)]` | Must be at least n characters |
| `[ValidateMaximumLength(n)]` | Must be at most n characters |
| `[ValidateRegularExpression(pattern)]` | Must match regex pattern |
| `[ValidateScalePrecision(scale, precision)]` | Numeric scale/precision |

### Type Validators (Request-Level)

Apply to the Request DTO class to enforce access control:

```csharp
[ValidateIsAuthenticated]              // Authenticated users only
[ValidateIsAdmin]                      // Admin users only
[ValidateHasRole("Employee")]          // Users with specific role
[ValidateHasClaim(type, value)]        // Users with specific claim
[ValidateHasScope(scope)]              // Users with specific scope
[ValidateHasPermission("CanEdit")]     // Users with specific permission
```

Example combining type and property validation:

```csharp
[ValidateHasRole("Employee")]
public class CreateBooking : ICreateDb<Booking>, IReturn<IdResponse>
{
    [ValidateNotEmpty]
    public string Name { get; set; }

    [ValidateGreaterThan(0)]
    public decimal Cost { get; set; }
}
```

## FluentValidation (Advanced)

For complex validation logic that requires conditional rules, cross-field validation, or database state, use FluentValidation:

```csharp
public class CreateBookingValidator : AbstractValidator<CreateBooking>
{
    public CreateBookingValidator()
    {
        RuleFor(r => r.Name).NotEmpty();
        RuleFor(r => r.Cost).GreaterThan(0);
        RuleFor(r => r.BookingEndDate)
            .GreaterThan(r => r.BookingStartDate)
            .WithMessage("End date must be after start date");
    }
}
```

Validators placed in the `ServiceInterface` project are auto-registered.

## Error Responses

Both approaches automatically convert validation failures into a `ResponseStatus` in the Response DTO. Field errors appear next to their corresponding `@servicestack/react` Input components, and other errors display via `<ErrorSummary>`.

## Best Practices

- **Declarative First**: Use `[Validate*]` attributes for simple property rules — they're visible in metadata and require no additional code.
- **FluentValidation for Complex Rules**: Use `AbstractValidator<T>` when you need conditional logic, cross-field validation, or custom error messages.
- **Validate Input Only**: Keep validators focused on Request DTO structure, not complex business rules requiring database state.
- **Consistent Error Codes**: Use `.WithErrorCode()` in FluentValidation for custom error codes clients can handle.
- **No Manual Registration**: `ValidationFeature` and validators are auto-registered — no `Plugins.Add()` or `container.RegisterValidators()` needed.
