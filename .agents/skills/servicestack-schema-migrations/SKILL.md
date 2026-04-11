---
name: servicestack-schema-migrations
description: Manages schema evolution using OrmLite migrations, EF Core Identity migrations, and okai code generation.
---

# ServiceStack Schema Migrations

This project uses a **dual migration strategy**: OrmLite for application data and EF Core for Identity tables.

## OrmLite Migrations

Create classes that inherit from `MigrationBase` with `Up` and `Down` methods:

```csharp
public class Migration1000 : MigrationBase
{
    public override void Up()
    {
        Db.CreateTable<Booking>();
    }

    public override void Down()
    {
        Db.DropTable<Booking>();
    }
}
```

Migration files live in `Fortunato/Migrations/`.

## EF Core Migrations (Identity Only)

EF Core manages the ASP.NET Core Identity schema:

```bash
# Create a new Identity migration
dotnet ef migrations add MigrationName

# Apply pending migrations
dotnet ef database update
```

## Running All Migrations

```bash
# Run both OrmLite and EF Core migrations
cd Fortunato && npm run migrate

# Revert last OrmLite migration
cd Fortunato && npm run revert:last

# Drop and re-run last migration (dev convenience)
cd Fortunato && npm run rerun:last
```

Migrations also run automatically via the `postinstall` script when running `npm install` in `Fortunato.Client/`.

## okai Code Generation (Recommended for New Features)

The `npx okai` tool generates both C# AutoQuery APIs **and** OrmLite migrations from TypeScript data models:

### Workflow

```bash
# 1. Create a new feature scaffold
npx okai init Feature

# 2. Edit the TypeScript data model
#    Fortunato.ServiceModel/Feature.d.ts

# 3. Generate C# code (APIs + migration)
npx okai Feature.d.ts

# 4. Run the migration
npm run migrate
```

### TypeScript Data Model Example

The `.d.ts` files use special decorators that map to C# attributes:

```typescript
// Fortunato.ServiceModel/Bookings.d.ts
declare class Booking {
    /** @autoIncrement */
    id: number
    /** @validateNotEmpty */
    name: string
    roomType: RoomType
    /** @intlDecimal */
    cost: number
    bookingStartDate: string  // DateTime
    bookingEndDate?: string   // DateTime?
}
```

See `Fortunato.ServiceModel/api.d.ts` for the full decorator schema.

### Regenerating After Model Changes

```bash
# Edit the .d.ts model, then regenerate
npx okai Feature.d.ts

# Run migration to apply schema changes
npm run migrate
```

### Removing a Feature

```bash
# Remove AutoQuery feature and all generated code
npx okai rm Feature.d.ts
```

## Schema Modification Methods

```csharp
// Table operations
Db.CreateTable<T>();
Db.DropTable<T>();

// Column operations
Db.AddColumn<T>(x => x.NewField);
Db.DropColumn<T>(x => x.OldField);
Db.AlterColumn<T>(x => x.ModifiedField);

// Index operations
Db.CreateIndex<T>(x => x.FieldName);

// Raw SQL for complex transformations
Db.ExecuteSql("ALTER TABLE ...");
```

## Conventions

- **Naming**: Use sequential numbering (e.g., `Migration1000`, `Migration1001`) or timestamps.
- **Location**: OrmLite migrations in `Fortunato/Migrations/`, EF migrations also in `Fortunato/Migrations/`.
- **Declarative**: Use `Db.CreateTable<T>()` to keep POCOs as the source of truth.

## Best Practices

- **Never Modify Committed Migrations**: Once shared, create a new migration instead of editing existing ones.
- **okai for New Features**: Use `npx okai init` + `.d.ts` models for rapid feature scaffolding with generated migrations.
- **Test Rollbacks**: Always implement and test the `Down` method.
- **Dual Strategy**: OrmLite for all app data, EF Core only for Identity tables.
- **npm run migrate**: Use this to execute both OrmLite and EF Core migrations together.
