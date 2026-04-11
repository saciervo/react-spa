---
name: servicestack-project-structure
description: Understands ServiceStack's modular IHostingStartup configuration, project layout, and plugin-based architecture.
---

# ServiceStack Project Structure

Follow these conventions when working with or refactoring ServiceStack project layouts.

## Standard Layout (4-Project Structure)

1. **`ServiceModel` (DTOs / Service Contracts)**:
   - Contains all Request and Response DTOs, plus TypeScript data models (`.d.ts`) for okai code generation.
   - **Crucial**: Must be dependency-free, logic-free (POCOs only).
   - Shared with clients via DTO generation (`npm run dtos`).

2. **`ServiceInterface` (Implementation)**:
   - Houses service implementation classes and EF Core DbContext/Identity models.
   - References `ServiceModel` and other logic/dependency projects.

3. **`Host` (Web/Host — e.g., `Fortunato/`)**:
   - The ASP.NET Core entry point with `Program.cs`.
   - Contains modular `Configure.*.cs` files (see below).
   - References `ServiceInterface`.

4. **`Tests` (Testing)**:
   - Unit and integration tests.
   - References `ServiceInterface` and `Host`.

## Modular Configuration with `IHostingStartup`

ServiceStack v8+ uses the `IHostingStartup` pattern to split configuration across multiple files. Each `Configure.*.cs` file is auto-registered via an assembly attribute:

```csharp
[assembly: HostingStartup(typeof(MyApp.ConfigureAuth))]

namespace MyApp;

public class ConfigureAuth : IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices(services => {
            services.AddPlugin(new AuthFeature(IdentityAuth.For<ApplicationUser>(options => {
                options.SessionFactory = () => new CustomUserSession();
                options.CredentialsAuth();
            })));
        });
}
```

### Standard Configuration Files

| File | Responsibility |
|---|---|
| `Configure.AppHost.cs` | Main ServiceStack AppHost registration |
| `Configure.Auth.cs` | Authentication (Identity Auth integration) |
| `Configure.AutoQuery.cs` | AutoQuery features and audit events |
| `Configure.Db.cs` | Database setup (OrmLite + EF Core) |
| `Configure.Db.Migrations.cs` | OrmLite and EF migrations, seed data |
| `Configure.BackgroundJobs.cs` | Background job processing |
| `Configure.HealthChecks.cs` | Health monitoring endpoints |

### Plugin Registration

Register ServiceStack plugins using DI `services.AddPlugin()`:

```csharp
services.AddPlugin(new AutoQueryFeature { MaxLimit = 1000 });
```

## Program.cs

`Program.cs` stays clean — it sets up the ASP.NET Core host, middleware pipeline, and Vite dev server proxy. All ServiceStack-specific configuration lives in `Configure.*.cs` modules.

## Service Registration

Services are automatically discovered in assemblies passed to the AppHost constructor. Any class inheriting from `Service` in those assemblies is registered.

## Best Practices

- **Modular Config**: Split configuration into focused `Configure.*.cs` files using `IHostingStartup`. This keeps `Program.cs` clean and separates concerns.
- **DI Pattern**: Use `services.AddPlugin()` and constructor injection. Avoid `container.Register()` from legacy patterns.
- **Keep Host Lean**: The Host project should only focus on configuration and wiring — no business logic.
- **Strict Hierarchy**: `Host` → `ServiceInterface` → `ServiceModel`. No circular dependencies.
- **Naming Convention**: Follow `Configure.{Feature}.cs` naming for consistency.

## Legacy Note

Pre-v8 projects used `AppHostBase` with a `Configure(Container container)` method and `Plugins.Add()`. This is replaced by the `IHostingStartup` pattern with `services.AddPlugin()`.
