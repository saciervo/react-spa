---
name: servicestack-testing
description: Tests services using ServiceStack’s testing utilities and in-memory hosts.
---

# ServiceStack Testing

ServiceStack provides excellent support for both unit and integration testing. **Start with unit tests by default** — only add integration tests when you need to verify HTTP pipeline behavior.

## Unit Testing (default approach)

Use `BasicAppHost` with in-memory SQLite. Resolve the service from the IOC container and call its methods directly — no HTTP overhead. This tests service logic, database interactions, error conditions, and DI wiring.

```csharp
[TestFixture]
public class MyServiceTests
{
    private ServiceStackHost appHost;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        appHost = new BasicAppHost(typeof(MyServices).Assembly)
        {
            ConfigureContainer = container =>
            {
                container.Register<IDbConnectionFactory>(
                    new OrmLiteConnectionFactory(":memory:", SqliteDialect.Provider));

                container.RegisterAs<MyRealRepo, IMyRepo>();

                using var db = container.Resolve<IDbConnectionFactory>().Open();
                db.DropAndCreateTable<MyTable>();
            }
        }.Init();
    }

    [OneTimeTearDown]
    public void OneTimeTearDown() => appHost.Dispose();

    [Test]
    public void Can_get_record()
    {
        var service = appHost.Container.Resolve<MyServices>();
        var response = service.Get(new GetRecord { Id = 1 });
        Assert.That(response.Result.Name, Is.EqualTo("Expected"));
    }

    [Test]
    public void Throws_on_missing_record()
    {
        var service = appHost.Container.Resolve<MyServices>();
        Assert.Throws<HttpError>(() =>
            service.Get(new GetRecord { Id = 999 }));
    }
}
```

## Integration Testing (when needed)

Use `AppSelfHostBase` with a `JsonServiceClient` to test the full HTTP pipeline. **Only needed** when verifying:
- HTTP routing and verbs
- Request/response serialization round-trips
- Authentication/validation filters that run in the pipeline
- Real `WebServiceException` status codes over the wire

```csharp
[TestFixture]
public class MyIntegrationTests
{
    const string BaseUrl = "http://localhost:2000/";
    private ServiceStackHost appHost;

    [OneTimeSetUp]
    public void OneTimeSetUp() => appHost = new AppHost()
        .Init()
        .Start(BaseUrl);

    [OneTimeTearDown]
    public void OneTimeTearDown() => appHost.Dispose();

    [Test]
    public void Can_call_service_over_http()
    {
        var client = new JsonServiceClient(BaseUrl);
        var response = client.Get(new MyRequest { Name = "Test" });
        Assert.That(response.Result, Is.EqualTo("Hello, Test!"));
    }

    [Test]
    public void Returns_404_for_missing_record()
    {
        var client = new JsonServiceClient(BaseUrl);
        var ex = Assert.Throws<WebServiceException>(() =>
            client.Get(new GetRecord { Id = 999 }));
        Assert.That(ex.StatusCode, Is.EqualTo(404));
    }
}
```

## Mocking

Mock only external boundaries (HTTP APIs, blockchain, file system). Use real implementations with in-memory SQLite for repositories and database access. ServiceStack’s DI makes it easy to swap implementations in `ConfigureContainer` during test setup.

## When to Use Which

| Aspect | Unit Test (`BasicAppHost`) | Integration Test (`AppSelfHostBase`) |
|--------|---------------------------|--------------------------------------|
| Speed | Fast (no HTTP) | Slower (real HTTP) |
| Scope | Service logic, DB, errors | Full pipeline (routing, filters, serialization) |
| Default | **Yes — start here** | Only when pipeline behavior matters |
| DB | In-memory SQLite | In-memory SQLite |
| External deps | Mock | Mock |

## Best Practices

- **Start with unit tests** using `BasicAppHost` — most ServiceStack services are just function calls on DTOs.
- **SQLite In-Memory**: Use for fast, isolated database testing with real OrmLite queries.
- **Mock only external boundaries**: Use real repositories with in-memory SQLite, mock HTTP clients and external services.
- **Isolation**: Ensure each test is independent and resets any global state.
- **Contract Testing**: Focus on verifying the DTO contracts to ensure clients won’t break.
- **AppHost Reuse**: Share a common `AppHost` configuration for related tests.
