---
name: servicestack-dto-design
description: Designs request/response DTOs using DTO-first, message-based ServiceStack conventions.
---

# ServiceStack DTO Design

ServiceStack APIs are defined by their Request DTOs. Follow these principles for robust API design.

## Message-Based Design

- Define APIs as "Messages" (Actions), not "Resources" (Nouns).
- A Service is defined by its **Request DTO**.
- Use POCOs (Plain Old C# Objects) for DTOs. They should be logic-free and dependency-free.

## Request DTO Conventions

- **Naming**: Use descriptive names that represent the action (e.g., `GetCustomers`, `CreateOrder`).
- **Interfaces**: Use `IReturn<T>` to define the response type.
  ```csharp
  public class GetCustomer : IReturn<CustomerResponse> 
  {
      public int Id { get; set; }
  }
  ```
- **Verbs**: Optionally use `IVerb` interfaces (e.g., `IGet`, `IPost`) to restrict allowed HTTP methods.
- **Routes**: Use the `[Route]` attribute to define the API endpoint.
  ```csharp
  [Route("/customers/{Id}", "GET")]
  ```

## Response DTO Conventions

- **Consistency**: Ideally, every Request DTO should have a corresponding Response DTO.
- **Envelope Pattern**: Include a `ResponseStatus` property to enable structured error handling by clients.
  ```csharp
  public class CustomerResponse 
  {
      public Customer Result { get; set; }
      public ResponseStatus ResponseStatus { get; set; }
  }
  ```
- **Avoid Collections as Root**: Return a discrete object rather than a list (e.g., `GetCustomersResponse` instead of `List<Customer>`) for future extensibility.

## Best Practices

- **Shared DTOs**: Keep DTOs in a standalone project (`ServiceModel`) so they can be shared with clients without code generation.
- **Agnostic Types**: Use simple types (string, int, bool) and avoid platform-specific types (e.g., `DataTable`) in DTOs.
- **Documentation**: Use `[Api("Description")]` and `[ApiMember(Description="...")]` attributes to enrich metadata/Swagger.
