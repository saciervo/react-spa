---
name: servicestack-authorization
description: Applies role-, permission-, claim-, and scope-based authorization using declarative validation attributes.
---

# ServiceStack Authorization

Authorization in ServiceStack v8+ uses **declarative validation attributes** applied to Request DTOs. These are decoupled from service implementations and visible in metadata.

## Declarative Authorization Attributes (Recommended)

```csharp
[ValidateIsAuthenticated]              // Authenticated users only
[ValidateIsAdmin]                      // Admin users only
[ValidateHasRole("Employee")]          // Users with specific role
[ValidateHasPermission("CanEdit")]     // Users with specific permission
[ValidateHasClaim("type", "value")]    // Users with specific claim
[ValidateHasScope("api:read")]         // Users with specific scope
```

### Example Usage

```csharp
[ValidateHasRole("Employee")]
public class CreateBooking : ICreateDb<Booking>, IReturn<IdResponse>
{
    [ValidateNotEmpty]
    public string Name { get; set; }
    [ValidateGreaterThan(0)]
    public decimal Cost { get; set; }
}

[ValidateIsAdmin]
public class AdminOnlyRequest : IReturn<AdminResponse> { }

[ValidateIsAuthenticated]
public class GetMyProfile : IGet, IReturn<GetMyProfileResponse> { }
```

### Combining Authorization

Multiple attributes apply as **AND** conditions:

```csharp
[ValidateIsAuthenticated]
[ValidateHasRole("Manager")]
public class ApproveExpense : IPost, IReturn<IdResponse> { }
```

## Ownership-Based Authorization

For resource-level access control, implement checks inside the service:

```csharp
public object Any(UpdateOrder request)
{
    var order = Db.SingleById<Order>(request.Id);
    if (order.CreatedBy != GetSession().UserAuthId)
        throw HttpError.Forbidden("You do not own this order.");

    // ... update logic
}
```

## Custom Authorization

For reusable custom authorization logic, create custom `[ValidateRequest]` expressions or implement `IHasRequestFilter`.

## Best Practices

- **Apply to DTOs**: Always apply authorization attributes to **Request DTOs** in the `ServiceModel` project — this ensures visibility in metadata and API documentation.
- **Use `Validate*` Attributes**: Prefer `[ValidateHasRole]`, `[ValidateIsAuthenticated]`, etc. over the legacy `[RequiredRole]`/`[RequiredPermission]` attributes.
- **Declarative Over Imperative**: Use attributes to keep service code clean; reserve imperative checks for ownership/resource-level authorization.
- **Metadata Integration**: Authorization requirements from declarative attributes are automatically included in ServiceStack metadata pages and API Explorer.

## Legacy Note

Pre-v8 projects used `[RequiredRole]`, `[RequiresAnyRole]`, and `[RequiredPermission]`. These still work but the `[Validate*]` attributes are recommended as they are implementation-free and work consistently with declarative validation.
