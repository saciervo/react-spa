---
name: servicestack-typed-clients
description: Leverages typed ServiceStack clients with ApiResult pattern and DTO reuse across boundaries.
---

# ServiceStack Typed Clients

Typed clients provide a type-safe way to consume ServiceStack APIs without manual URL construction.

## Supported Clients

- **C#**: `JsonServiceClient`, `JsonHttpClient`
- **TypeScript/JavaScript**: `JsonServiceClient` (from `@servicestack/client`)
- **Java/Kotlin**, **Swift**, **Dart**, etc.

## ApiResult Pattern (Recommended)

The `api()`, `apiVoid()`, and `apiForm()` methods return an `ApiResult<T>` that **never throws exceptions**. This is the recommended pattern.

### TypeScript Usage

```typescript
import { client } from '@/lib/gateway'
import { QueryBookings, Hello } from '@/lib/dtos'

// api() returns ApiResult<T> — never throws
const api = await client.api(new Hello({ name: "World" }))
if (api.succeeded) {
    console.log('Success:', api.response.result)
} else if (api.error) {
    console.log('Error:', api.error.message)
}
```

> **Important**: Never use `try/catch` around `client.api*` calls — they never throw exceptions. They always return an `ApiResult<T>` with either a `response` (success) or `error` (failure).

### React Component Pattern

```typescript
import { useClient, ApiResult } from '@servicestack/react'
import { Hello, HelloResponse } from '@/lib/dtos'

export default ({ value }: { value: string }) => {
    const [name, setName] = useState(value)
    const client = useClient()
    const [api, setApi] = useState<ApiResult<HelloResponse>>(new ApiResult())

    useEffect(() => {
        (async () => {
            setApi(new ApiResult())
            setApi(await client.api(new Hello({ name })))
        })()
    }, [name])

    return (<div>
        {api.error
            ? <div className="text-red-500">{api.error.message}</div>
            : api.succeeded
                ? <div>{api.response.result}</div>
                : <div>loading...</div>}
    </div>)
}
```

### Form Submissions with `apiForm()`

Use `apiForm` for multipart/form-data file uploads or HTML form submissions:

```typescript
const submit = async (e: React.FormEvent) => {
    const form = e.currentTarget as HTMLFormElement
    const api = await client.apiForm(new CreateContact(), new FormData(form))
    if (api.succeeded) {
        console.log('Created:', api.response)
    }
}
```

### Void Responses

For APIs that return no response body:

```typescript
const api = await client.apiVoid(new DeleteBooking({ id: 1 }))
if (api.succeeded) {
    console.log('Deleted successfully')
}
```

## C# Client Usage

```csharp
var client = new JsonServiceClient(BaseUrl);

// Typed API call
var response = await client.ApiAsync(new GetCustomer { Id = 1 });
if (response.Succeeded)
    Console.WriteLine(response.Response.Name);
```

## DTO Generation

TypeScript DTOs are auto-generated from C# Request/Response DTOs:

```bash
cd Fortunato.Client && npm run dtos
```

This calls ServiceStack's `/types/typescript` endpoint and updates `src/lib/dtos.ts`.

## Best Practices

- **ApiResult Pattern**: Always use `api()` / `apiVoid()` / `apiForm()` — they never throw and return structured results.
- **No try/catch**: Using `try/catch` around `client.api*` is always wrong since exceptions are never thrown.
- **Reuse DTOs**: C# clients share the same DTO assembly; TypeScript clients use generated `dtos.ts`.
- **useClient() in React**: Use `useClient()` hook to resolve a configured client in React components.
- **Regenerate on Changes**: After modifying C# DTOs, restart .NET and run `npm run dtos` to update TypeScript types.
