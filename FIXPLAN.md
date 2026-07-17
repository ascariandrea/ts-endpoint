# Fix Plan: Client-side Body types with filter constraints (nonEmptyRecord)

## Context

When a server-side endpoint defines its Body schema with `nonEmptyRecordFromType` (or any
schema that wraps a Struct in a `filter`), the TypeScript type derived by
`TypeOfEndpointInstanceInput` for the client call can become hard to satisfy without a cast.

## Root cause

`TypeOfEndpointInstanceInput` maps each Input section (Body, Params, etc.) through
`serializedType<C>`, which correctly extracts the **Encoded** type from `EffectCodec<Type, Encoded>`.

For a field like `bornOn: OptionFromNullishToNull(Schema.Date)`:
- `Type` = `Option<Date>`     (what the server sees after decoding)
- `Encoded` = `Date | null | undefined`  (what the client should send)

`serializedType` gives `Date | null | undefined` — correct.

However, when the entire Body codec is wrapped in a `filter` (via `nonEmptyRecordFromType`),
the resulting schema type becomes opaque and TypeScript cannot prove that the object constructed
by the caller satisfies the branded/filtered constraint. The only practical workaround from the
caller side is `Body: buildPayload(...) as any`.

## What is NOT a bug

`runtimeType<C>` extracts `C.Type` (the decoded runtime form, e.g. `Option<Date>`).
`serializedType<C>` extracts `C.Encoded` (the wire-encoded form, e.g. `Date | null | undefined`).

Despite the potentially confusing names:
- `runtimeType` is correctly used for **Output** (decoded after receiving the response).
- `serializedType` is correctly used for **Input** (encoded before sending the request).

Do NOT wrap Body fields with `O.fromNullable` — that produces `Option<T>` (decoded form) which
is wrong for HTTP payloads. The HTTP client does `JSON.stringify(body)` directly with no encoding
step (see `packages/http-client/src/fetch.ts:71`).

## Suggested fix

### Option A — `TypeOfEndpointInstanceInput` strips filter brands from Body

For the Body input type only, strip `Brand` and `filter` wrappers so the client receives a plain
partial struct type. This relaxes the compile-time check but accurately reflects that the client
cannot statically guarantee non-emptiness:

```typescript
// In Endpoint.ts, TypeOfEndpointInstanceInput:
// Currently:
UndefinedsToPartial<serializedType<NonNullable<E['Input']>[K]>>
// For Body, could be:
Partial<serializedType<NonNullable<E['Input']>[K]>>
```

But this would weaken types for Params/Query too unless Body is handled separately.

### Option B — Separate `BodyInput` type alias

Export a `BodyInput<E>` helper that callers can use to construct the correct partial type:

```typescript
export type BodyInput<E extends MinimalEndpointInstance> =
  E['Input'] extends { Body: Codec<any, any> }
    ? Partial<serializedType<NonNullable<E['Input']['Body']>>>
    : never;
```

This gives a clear escape hatch and self-documents the intent.

### Option C (short-term / pragmatic)

Document that callers using edit/patch endpoints with `nonEmptyRecordFromType` Body schemas
should cast `Body` with `as any`, since the non-emptiness constraint cannot be statically verified
from the caller side.

## Affected files

- `packages/core/src/Endpoint.ts` — `TypeOfEndpointInstanceInput`
- `packages/resource-client/src/ResourceClient.ts` — `EndpointRequest`

## References

- `nonEmptyRecordFromType` in lies-exposed: `packages/@liexp/io/src/Common/NonEmptyRecord.ts`
- Actor Edit endpoint: `packages/@liexp/shared/src/endpoints/api/actor.endpoints.ts`
- CLI actor-edit command: `services/agent/src/cli/actors/actor-edit.ts`
