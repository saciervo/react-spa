---
name: servicestack-autoquery
description: Implements AutoQuery services with implicit conventions, CRUD operations, and okai code generation.
---

# ServiceStack AutoQuery

AutoQuery provides instant, queryable CRUD APIs from OrmLite data models with no service implementation required.

## Query APIs

Inherit from `QueryDb<T>` to create a queryable API:

```csharp
public class QueryBookings : QueryDb<Booking>
{
    public int? Id { get; set; }
    public decimal? MinCost { get; set; }
    public List<decimal>? CostBetween { get; set; }
    public List<int>? Ids { get; set; }
}
```

No service implementation needed — AutoQuery handles it automatically.

## Implicit Conventions

AutoQuery uses naming conventions to determine filter behavior:

| Convention | SQL Filter | Example |
|---|---|---|
| Exact match | `{Field} = {Value}` | `Id` → `Id = 1` |
| `Min%` | `{Field} >= {Value}` | `MinCost` → `Cost >= 100` |
| `Max%` | `{Field} < {Value}` | `MaxCost` → `Cost < 200` |
| `%Between%` | `BETWEEN {Value1} AND {Value2}` | `CostBetween` → `Cost BETWEEN 100 AND 200` |
| `%In` / `%Ids` | `{Field} IN ({Values})` | `Ids` → `Id IN (1,2,3)` |
| `%Above%` / `%GreaterThan%` | `{Field} > {Value}` | `CostGreaterThan` |
| `%Below%` / `%LessThan%` | `{Field} < {Value}` | `CostLessThan` |
| `%From%` / `Since%` / `Start%` | `{Field} >= {Value}` | `FromDate` |
| `%Before%` / `End%` / `Until%` | `{Field} < {Value}` | `UntilDate` |
| `Like%` | `UPPER({Field}) LIKE UPPER({Value})` | `LikeName` |
| `%IsNull` | `{Field} IS NULL` | `NameIsNull` |
| `%IsNotNull` | `{Field} IS NOT NULL` | `NameIsNotNull` |

Multiple properties apply **AND** filters:

```typescript
const api = client.api(new QueryBookings({ minCost: 100, ids: [1, 2, 3] }))
// → (Cost >= 100) AND (Id IN (1,2,3))
```

## AutoQuery CRUD

Generate full CRUD APIs from declarative Request DTOs:

```csharp
[ValidateHasRole("Employee")]
[AutoApply(Behavior.AuditCreate)]
public class CreateBooking : ICreateDb<Booking>, IReturn<IdResponse>
{
    [ValidateNotEmpty]
    public string Name { get; set; }
    [ValidateGreaterThan(0)]
    public decimal Cost { get; set; }
    public RoomType RoomType { get; set; }
    public DateTime BookingStartDate { get; set; }
    public DateTime? BookingEndDate { get; set; }
}

[ValidateHasRole("Employee")]
[AutoApply(Behavior.AuditModify)]
public class UpdateBooking : IPatchDb<Booking>, IReturn<IdResponse>
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public decimal? Cost { get; set; }
}

[ValidateHasRole("Manager")]
[AutoApply(Behavior.AuditSoftDelete)]
public class DeleteBooking : IDeleteDb<Booking>, IReturnVoid
{
    public int Id { get; set; }
}
```

### CRUD Interfaces

| Interface | HTTP Verb | Operation |
|---|---|---|
| `ICreateDb<T>` | POST | Create |
| `IUpdateDb<T>` | PUT | Full Update |
| `IPatchDb<T>` | PATCH | Partial Update |
| `IDeleteDb<T>` | DELETE | Delete |

### Audit Behaviors

- `[AutoApply(Behavior.AuditCreate)]` — Populates `CreatedBy`, `CreatedDate`, `ModifiedBy`, `ModifiedDate`
- `[AutoApply(Behavior.AuditModify)]` — Populates `ModifiedBy`, `ModifiedDate`
- `[AutoApply(Behavior.AuditSoftDelete)]` — Populates `DeletedBy`, `DeletedDate` (soft delete)

## okai Code Generation

The `npx okai` tool generates C# AutoQuery APIs and migrations from TypeScript data models:

```bash
# Create a new feature with TypeScript data model
npx okai init Feature

# Edit Fortunato.ServiceModel/Feature.d.ts to define the entity

# Generate C# AutoQuery APIs + migration from the .d.ts model
npx okai Feature.d.ts

# Run migration to create the database table
npm run migrate

# Remove a feature and all generated code
npx okai rm Feature.d.ts
```

The `.d.ts` files use special decorators (e.g., `@validateHasRole`, `@autoIncrement`) that map to C# attributes. See `api.d.ts` for the valid schema.

## React UI Integration with `@servicestack/react`

For metadata-driven React pages, prefer `@servicestack/react` components over handwritten CRUD screens when AutoQuery already exposes the model.

### AutoQueryGrid for fast CRUD pages

Use `AutoQueryGrid` with the model name exposed in generated TypeScript DTO metadata:

```tsx
import Page from '@/components/LayoutPage'
import { ValidateAuth } from '@/lib/auth'
import { AutoQueryGrid } from '@servicestack/react'

function Index() {
    return (
        <Page title="Bookings CRUD">
            <AutoQueryGrid type="Booking" />
        </Page>
    )
}

export default ValidateAuth(Index, { role: 'Employee' })
```

- Use the `type` name from the generated DTO metadata, e.g. `Booking`
- Protect the page with the project's `ValidateAuth` wrapper when the underlying Request DTOs require a role
- Let AutoQuery metadata drive the grid rather than manually duplicating DTO field configuration in React

### Customize columns instead of replacing the grid

When the default metadata-driven grid is close but not ideal, customize it with `selectedColumns`, `visibleFrom`, and slot overrides before building a fully custom page:

```tsx
<AutoQueryGrid
    type="Booking"
    hide={['copyApiUrl','downloadCsv']}
    selectedColumns={['id', 'name', 'cost', 'bookingStartDate', 'bookingEndDate']}
    visibleFrom={{
        bookingStartDate: 'sm',
        bookingEndDate: 'xl',
    }}
    columnSlots={{
        cost: ({ cost }: { cost: number }) => <span>{currency(cost)}</span>,
    }}
    headerSlots={{
        'bookingStartDate-header': () => <>Start Date</>,
    }}
/>
```

- Prefer metadata + slot customization over bespoke table implementations
- Keep custom formatting focused on presentation, not business logic
- If a page needs significantly more control, document why `AutoQueryGrid` is insufficient

### Link users to built-in discovery tools

When a feature is primarily metadata-driven, it can be useful to link users to Locode or API Explorer for the same Request DTOs:

```tsx
<a href="/locode/QueryBookings">Locode</a>
<a href="/ui/QueryBookings">API Explorer</a>
```

This is especially useful for admin and internal tooling because it reinforces that AutoQuery APIs are first-class metadata surfaces, not just backend endpoints.

## Custom Implementation

Override AutoQuery when custom logic is needed:

```csharp
public class BookingServices(IAutoQueryDb autoQuery) : Service
{
    public async Task<object> Any(QueryBookings request)
    {
        using var db = autoQuery.GetDb(request, base.Request);
        var q = autoQuery.CreateQuery(request, base.Request, db);
        return await autoQuery.ExecuteAsync(request, q, base.Request, db);
    }
}
```

## Best Practices

- **Declarative CRUD**: Use AutoQuery CRUD interfaces — no service implementation needed for standard operations.
- **Typed Filters**: Prefer adding properties to the DTO over raw query manipulation for better metadata exposure.
- **Limit Results**: Configure `MaxLimit` in `AutoQueryFeature` to prevent large payloads.
- **okai Workflow**: Use `npx okai` for rapid prototyping — edit `.d.ts`, regenerate, migrate.
- **Security**: Apply `[ValidateHasRole]` and other authorization attributes to CRUD DTOs.
- **Audit Trail**: Use `[AutoApply(Behavior.Audit*)]` for automatic audit field population.
- **React Admin UIs**: Prefer `AutoQueryGrid` and related `@servicestack/react` components for metadata-driven CRUD screens.
- **Auth Alignment**: Match frontend page guards like `ValidateAuth(..., { role })` to the authorization declared on the Request DTOs.
- **Built-in Tooling**: Consider linking related AutoQuery features to `/locode/*` and `/ui/*` so users can inspect the same APIs through ServiceStack's built-in tools.
