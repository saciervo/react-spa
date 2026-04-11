---
name: servicestack-refactoring-review
description: Reviews and refactors code to enforce ServiceStack idioms and eliminate MVC / ASP.NET Core leakage.
---

# ServiceStack Refactoring & Review

Use this skill when reviewing existing codebases or refactoring to better align with ServiceStack's message-based architecture.

## Identifying MVC Leakage

Watch out for patterns that belong in MVC/WebAPI but not in ServiceStack:
- **Attribute Overload**: Using excessive MVC-specific attributes on DTOs.
- **Controller-like Logic**: services that try to handle routing or status codes manually instead of throwing exceptions.
- **Manual URL Building**: Using string concatenation instead of typed clients or `ToUrl()`.

## Enforcing ServiceStack Idioms

- **DTO-First**: Move any logic out of DTOs.
- **Implicit Dependencies**: Use `base.Db`, `base.Cache`, etc., instead of manually resolving them from IoC everywhere.
- **ResponseStatus**: Ensure all response DTOs include this property.

## Refactoring Steps

1.  **Extract DTOs**: If requests are "blurry," define clear, discrete Request/Response DTOs.
2.  **Service Realignment**: Move implementation logic from `AppHost` or Controllers into `ServiceInterface` classes.
3.  **Validation Migration**: Move manual `if` checks into `FluentValidation` classes.
4.  **OrmLite Adoption**: Replace complex ORM logic with clean, POCO-friendly OrmLite queries.

## Best Practices

- **Readability**: Code should read like a set of messages and their handlers.
- **Consistency**: Maintain a unified style across all services in the codebase.
- **Metadata Visibility**: Ensure all APIs are visible on the `/metadata` page after refactoring.
- **Typed Client Readiness**: If a service can't be easily called by a typed C# client, it needs refactoring.
