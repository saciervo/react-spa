---
name: servicestack-api-design
description: Designs stable, discoverable APIs using routes, metadata, and versioning conventions.
---

# ServiceStack API Design

ServiceStack promotes a message-based API design that is inherently discoverable and evolution-friendly.

## Route Design

- **Meaningful Paths**: Use hierarchical and intuitive paths (e.g., `/orders/{Id}/items`).
- **RESTful Mapping**: Map HTTP verbs to actions (GET for read, POST for create, PUT/PATCH for update, DELETE for delete).
- **Explicit Verbs**: Define allowed verbs in the `[Route]` attribute.

```csharp
[Route("/customers", "GET")]
[Route("/customers", "POST")]
```

## Metadata & Documentation

- **Self-Documenting**: ServiceStack's metadata page (`/metadata`) is automatically generated from DTOs.
- **Annotations**: Use `[Description]`, `[ApiMember]`, and `[Notes]` to provide context for API consumers.
- **Tags**: Use `[Tag("Category")]` to group services in OpenAPI/Swagger UI.

## Versioning

- **Compatibility**: Prefer additive changes (adding new properties) over breaking changes.
- **URL Versioning**: Use `/v1/...`, `/v2/...` if breaking changes are unavoidable.
- **Header Versioning**: Alternatively, use custom headers or the `Accept` header.

## Best Practices

- **Consistency**: Use a consistent naming convention (e.g., camelCase for JSON properties).
- **Security**: Always consider authentication/authorization during the design phase.
- **Error Handling**: Ensure all APIs return a consistent `ResponseStatus` envelope for errors.
- **Discoverability**: leverage the built-in `/metadata` and `/openapi` features.
