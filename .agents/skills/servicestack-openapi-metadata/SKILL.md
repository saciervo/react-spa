---
name: servicestack-openapi-metadata
description: Configures OpenAPI v3 documentation with Swagger UI or Scalar UI using modular startup.
---

# ServiceStack OpenAPI and Metadata

ServiceStack automatically generates metadata and supports OpenAPI v3 documentation via two packages:
- **`ServiceStack.OpenApi.Swashbuckle`** — Swagger UI integration
- **`ServiceStack.OpenApi.Microsoft`** — Scalar UI integration

## Configuration (Swashbuckle / Swagger UI)

Use an `IHostingStartup` module to configure OpenAPI with Swagger UI:

```csharp
[assembly: HostingStartup(typeof(MyApp.ConfigureOpenApi))]

namespace MyApp;

public class ConfigureOpenApi : IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices((context, services) =>
        {
            if (context.HostingEnvironment.IsDevelopment())
            {
                services.AddEndpointsApiExplorer();
                services.AddSwaggerGen();

                services.AddServiceStackSwagger();
                services.AddBasicAuth<ApplicationUser>();
                //services.AddJwtAuth();

                services.AddTransient<IStartupFilter, StartupFilter>();
            }
        });

    public class StartupFilter : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
            => app => {
                app.UseSwagger();
                app.UseSwaggerUI();
                next(app);
            };
    }
}
```

### Authentication for Swagger

- `services.AddBasicAuth<ApplicationUser>()` — Enable HTTP Basic Auth for Swagger UI testing
- `services.AddJwtAuth()` — Enable JWT Auth for Swagger UI testing

## Built-in API Explorer

ServiceStack includes its own API Explorer at `/ui` which requires no additional configuration:
- Auto-generated from Request DTOs
- Supports authentication testing
- Available at `https://localhost:5001/ui`

## Built-in Admin UI

The Admin UI at `/admin-ui` provides database management, user administration, and API exploration. Requires the Admin role.

## Controlling Exposure

- **`[Exclude(Feature.Metadata)]`** — Hides a service from metadata and Swagger
- **`[Restrict(InternalOnly = true)]`** — Limits access to internal requests only
- **`[ExcludeMetadata]`** — Excludes from metadata pages

## Customizing Documentation

- Use `[Api("Description")]` on Request DTOs for high-level descriptions
- Use `[ApiMember]` on properties for parameter documentation
- Use `[Description]` and `[Notes]` for additional context
- Use `[Tag("Category")]` to group APIs in Swagger UI

## Best Practices

- **POCOs as Source of Truth**: Let ServiceStack auto-generate docs from your DTOs — avoid maintaining separate API documentation.
- **Development Only**: Typically enable Swagger UI only in development environments.
- **Enrich DTOs**: Add `[Description]` and `[ApiMember]` attributes to improve the client-side developer experience.
- **Use API Explorer**: ServiceStack's built-in `/ui` API Explorer is always available and often sufficient without Swagger.
- **Security**: Hide internal services from public metadata using `[Exclude]` or `[Restrict]` attributes.

## Legacy Note

The old `Plugins.Add(new OpenApiFeature())` is replaced by the Swashbuckle or Microsoft (Scalar) integrations configured via `IHostingStartup`.
