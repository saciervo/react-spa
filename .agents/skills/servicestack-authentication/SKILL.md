---
name: servicestack-authentication
description: Implements authentication using ASP.NET Core Identity Auth integrated with ServiceStack.
---

# ServiceStack Authentication

ServiceStack v8+ uses **ASP.NET Core Identity** as the default authentication system, integrating it seamlessly with ServiceStack's `AuthFeature`.

## Configuration (ASP.NET Core Identity Auth)

Authentication is configured using `IdentityAuth.For<ApplicationUser>()` inside an `IHostingStartup` module:

```csharp
[assembly: HostingStartup(typeof(MyApp.ConfigureAuth))]

namespace MyApp;

public class ConfigureAuth : IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices(services => {
            services.AddPlugin(new AuthFeature(IdentityAuth.For<ApplicationUser>(options => {
                options.SessionFactory = () => new CustomUserSession();
                options.CredentialsAuth();    // Enable email/password login
                options.AdminUsersFeature();  // Enable /admin-ui/users management
            })));
        });
}
```

### Identity Auth Providers

Configure individual providers within the `IdentityAuth.For<T>()` options:

```csharp
services.AddPlugin(new AuthFeature(IdentityAuth.For<ApplicationUser>(options => {
    options.ApplicationAuth(o => {});   // IdentityApplicationAuthProvider (cookie-based)
    options.CredentialsAuth(o => {});   // IdentityCredentialsAuthProvider (email/password)
    options.JwtAuth(o => {});           // IdentityJwtAuthProvider (JWT tokens)
})));
```

### JWT Identity Auth

For stateless API architectures, add JWT Bearer authentication:

```csharp
// Program.cs
services.AddAuthentication()
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new()
        {
            ValidIssuer = config["JwtBearer:ValidIssuer"],
            ValidAudience = config["JwtBearer:ValidAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["JwtBearer:IssuerSigningKey"]!)),
            ValidateIssuerSigningKey = true,
        };
    })
    .AddIdentityCookies(options => options.DisableRedirectsForApis());
```

Then enable in the auth config:

```csharp
options.JwtAuth(x => {
    // Enable JWT Auth Features...
});
```

## Protecting Services

Use declarative validation attributes on Request DTOs:

```csharp
[ValidateIsAuthenticated]
public class MySecureRequest : IReturn<MyResponse> { }

[ValidateIsAdmin]
public class AdminRequest : IReturn<AdminResponse> { }

[ValidateHasRole("Employee")]
public class EmployeeRequest : IReturn<EmployeeResponse> { }
```

## Accessing Session Data

Inside a Service, use typed sessions:

```csharp
var session = await GetSessionAsync();
var userId = session.UserAuthId;
```

Or with a custom session:

```csharp
var session = await SessionAs<CustomUserSession>();
```

## Custom Claims

Add additional claims via `AdditionalUserClaimsPrincipalFactory`:

```csharp
services.AddTransient<IAdditionalUserClaimsPrincipalFactory, CustomClaimsPrincipalFactory>();
```

## Best Practices

- **Identity Auth is the default**: Use `IdentityAuth.For<ApplicationUser>()` for all new projects. No separate `IAuthRepository` needed — Identity manages user storage.
- **Custom Sessions**: Use `options.SessionFactory = () => new CustomUserSession()` to store additional session data.
- **JWT for APIs**: Use JWT Auth for distributed or stateless API architectures.
- **Modular Config**: Place auth configuration in a dedicated `Configure.Auth.cs` file using the `IHostingStartup` pattern.
- **Admin UI**: Enable `options.AdminUsersFeature()` for the built-in user management UI at `/admin-ui/users`.

## Legacy Note

Pre-v8 projects used `CredentialsAuthProvider` with `OrmLiteAuthRepository`. This approach is superseded by ASP.NET Core Identity Auth integration. Migrate to `IdentityAuth.For<T>()` for new development.
