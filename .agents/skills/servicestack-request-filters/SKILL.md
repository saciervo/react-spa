---
name: servicestack-request-filters
description: Uses global, attribute, and typed request/response filters correctly.
---

# ServiceStack Request Filters

Filters allow you to execute code before and after a service implementation.

## Global Filters

Applied to all requests in the `AppHost`.

```csharp
GlobalRequestFilters.Add((req, res, dto) => {
    // Logic before service
});

GlobalResponseFilters.Add((req, res, dto) => {
    // Logic after service
});
```

## Attribute Filters

Create reusable logic by inheriting from `RequestFilterAttribute` or `ResponseFilterAttribute`.

```csharp
public class MyFilterAttribute : RequestFilterAttribute
{
    public override void Execute(IRequest req, IResponse res, object requestDto)
    {
        // Custom logic
    }
}
```

## Typed Filters

ServiceStack supports typed filters for specific DTO types:

```csharp
RegisterTypedRequestFilter<IMyInterface>((req, res, dto) => { ... });
```

## Best Practices

- **Separation of Concerns**: Use filters for cross-cutting concerns (logging, custom auth, header manipulation) rather than business logic.
- **Short-circuiting**: You can short-circuit a request by writing to the response and calling `res.EndRequest()`.
- **Order of Execution**: Remember the sequence: Global -> Attribute -> Service.
- **Async Filters**: Use `GlobalRequestFiltersAsync` for non-blocking I/O in filters.
- **Prefer Attributes for Discovery**: Applying filters as attributes on DTOs makes them discoverable in metadata.
