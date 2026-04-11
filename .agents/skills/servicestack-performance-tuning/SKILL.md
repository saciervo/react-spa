---
name: servicestack-performance-tuning
description: Optimizes ServiceStack services, OrmLite usage, filters, and serialization.
---

# ServiceStack Performance Tuning

ServiceStack is built for high-performance and low-latency. Follow these tips to keep it that way.

## Caching

- **Output Caching**: Use the `[CacheResponse]` attribute or manual `ICacheClient` usage.
- **HTTP Caching**: Use `ServiceStack.HttpCache` to control client-side and proxy caching.

## OrmLite Optimization

- **Selective Queries**: Use `Db.Select<T>(q => q.Select(x => new { x.Id, x.Name }))` to fetch only what's needed.
- **Async API**: Always prefer `Async` methods for I/O.
- **Connection Pooling**: Use the default `IDbConnectionFactory` which handles pooling.
- **Indexing**: Ensure your OrmLite data models have appropriate `[Index]` attributes.

## Serialization

- **ServiceStack.Text**: The built-in JSON/CSV/JSV serializer is one of the fastest in .NET.
- **Avoid Heavy Types**: Keep DTOs lightweight; avoid circular references.

## Request Lifecycle

- **Lean Filters**: Keep global and attribute filters efficient. Avoid heavy I/O in filters if possible.

## Best Practices

- **Profiling**: Use the built-in Profiling features (`/profiler`) to identify bottlenecks.
- **Gzip/Compression**: Enable compression for large JSON payloads.
- **Minimum Dependencies**: Avoid adding unnecessary external packages that could bloat the application.
