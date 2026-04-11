---
name: servicestack-ormlite-usage
description: Uses OrmLite via the implicit Db connection with fluent configuration, transaction semantics, and JSON complex type serialization.
---

# ServiceStack OrmLite Usage

OrmLite is a lightweight Micro-ORM that maps POCOs to database tables.

## Configuration

Since v8.9, OrmLite uses a fluent configuration model:

```csharp
// Configure.Db.cs
services.AddSingleton<IDbConnectionFactory>(new OrmLiteConnectionFactory(
    connString, SqliteDialect.Provider));
```

## Data Models (POCOs)

Map 1 class to 1 table. Use attributes for schema control:

```csharp
public class Booking
{
    [AutoIncrement]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public RoomType RoomType { get; set; }

    [IntlDecimal]
    public decimal Cost { get; set; }

    public DateTime BookingStartDate { get; set; }
    public DateTime? BookingEndDate { get; set; }

    [Reference]
    public List<BookingComment> Comments { get; set; }
}
```

### Key Attributes

| Attribute | Purpose |
|---|---|
| `[AutoIncrement]` | Auto-incrementing primary key |
| `[PrimaryKey]` | Explicit primary key (non-auto-increment) |
| `[Required]` | NOT NULL constraint |
| `[Index]` / `[UniqueConstraint]` | Database indexes |
| `[StringLength(n)]` | VARCHAR length |
| `[Alias("column_name")]` | Map to different column name |
| `[Reference]` | One-to-many / one-to-one relationship |
| `[IgnoreDataMember]` | Exclude from serialization |
| `[Ignore]` | Exclude from OrmLite schema entirely |

### Complex Type Serialization

OrmLite serializes complex types (nested objects, collections) as **JSON** by default. This applies when storing non-scalar properties in text columns.

## Using the `Db` Connection

In a `Service` class, the `Db` property provides an auto-managed `IDbConnection`:

```csharp
// Querying
var all = Db.Select<Booking>();
var one = Db.SingleById<Booking>(1);
var filtered = Db.Select<Booking>(x => x.Cost > 100);
var loaded = Db.LoadSelect<Booking>(); // includes [Reference] data

// Modifying
var id = Db.Insert(new Booking { ... }, selectIdentity: true);
Db.Update(booking);
Db.DeleteById<Booking>(1);
```

### Async API

Use async variants for high-concurrency scenarios:

```csharp
var results = await Db.SelectAsync<Booking>();
var id = await Db.InsertAsync(booking, selectIdentity: true);
await Db.UpdateAsync(booking);
await Db.DeleteByIdAsync<Booking>(1);
```

## Transactions

Always use `using` blocks — transactions auto-rollback if not committed:

```csharp
using var trans = Db.OpenTransaction();
Db.Insert(obj1);
Db.Insert(obj2);
trans.Commit();
```

## Outside of Services

To use OrmLite outside of a ServiceStack Service, resolve `IDbConnectionFactory`:

```csharp
public class MyClass(IDbConnectionFactory dbFactory)
{
    public async Task DoWork()
    {
        using var db = await dbFactory.OpenDbConnectionAsync();
        var results = await db.SelectAsync<Booking>();
    }
}
```

## Best Practices

- **POCO Reuse**: OrmLite models can be reused as Response DTOs, but use `[IgnoreDataMember]` to hide sensitive fields or use discrete DTOs.
- **Async by Default**: Use `Async` variants (`SelectAsync`, `InsertAsync`, etc.) in service implementations.
- **Naming Conventions**: OrmLite uses PascalCase property-to-column mapping by default. Use `[Alias]` to map to different column names when needed.
- **JSON Complex Types**: Nested objects and collections are stored as JSON in text columns by default.
- **Relationships**: Use `[Reference]` with `LoadSelect` / `LoadSingleById` to include related data. This performs separate queries, not JOINs.
- **Service Base Class**: Inside a `Service`, use the `Db` property directly — it's auto-managed per request.
