---
name: servicestack-service-implementation
description: Implements services using Service / ServiceInterface, request lifecycle, and implicit dependencies.
---

# ServiceStack Service Implementation

Implement business logic in the `ServiceInterface` project by inheriting from the `Service` base class.

## Service Implementation Pattern

- Inherit from `Service`.
- Implement methods named after HTTP verbs (e.g., `Get`, `Post`, `Put`, `Delete`, `Any`).
- The method signature should accept the Request DTO.

```csharp
public class MyServices : Service
{
    public object Any(Hello request)
    {
        return new HelloResponse { Result = $"Hello, {request.Name}!" };
    }
}
```

## Implicit Dependencies

ServiceStack's `Service` base class provides easy access to commonly used resources:

- **`Db`**: The OrmLite IDbConnection (auto-disposed).
- **`Cache`**: Access to the registered ICacheClient.
- **`AuthRepository`**: If an AuthFeature is enabled.
- **`SessionBag` / `GetSession()`**: Access to the user's session.
- **`Request` / `Response`**: Low-level access to the underlying IRequest/IResponse.

## Request Lifecycle

1.  **Global Request Filters**: Executed before the service.
2.  **Attribute Filters**: Executed if present on the DTO or Service class.
3.  **Service Action**: Your implementation.
4.  **Attribute Response Filters**.
5.  **Global Response Filters**.

## Dependency Injection

- Register dependencies in `AppHost.Configure`.
- Use constructor injection or public properties (autowired) in your Service classes.

## Best Practices

- **Keep Services Thin**: Delegate complex logic to "Logic" or "Manager" classes.
- **Use Async**: Prefer `Async` methods for I/O bound operations (e.g., `GetAsync`, `PostAsync`).
- **Error Handling**: Throw exceptions to let ServiceStack handle the response mapping based on `ResponseStatus`.
