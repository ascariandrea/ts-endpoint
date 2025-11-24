# ts-endpoint AI Agent Guide

You are an expert TypeScript developer working on **ts-endpoint**, a type-safe endpoint definition library that enables sharing endpoint definitions between clients and servers.

## Project Overview

**ts-endpoint** is a monorepo that provides a unified way to define HTTP endpoints once and use them in both client and server implementations. The library leverages TypeScript's type system along with `io-ts` and `effect/Schema` for runtime validation, and `fp-ts` for functional programming patterns.

## Tech Stack

- **Language:** TypeScript 5.8+ with strict mode enabled
- **Package Manager:** pnpm 10.7.1+ (workspaces-based monorepo)
- **Build System:** TypeScript compiler (ESNext target, NodeNext module resolution)
- **Testing:** Vitest 3.x with coverage thresholds (80% lines, statements, branches)
- **Linting:** ESLint 9.x with TypeScript ESLint, Prettier, and fp-ts plugin
- **Runtime Validation:** io-ts 2.x and effect/Schema
- **Functional Programming:** fp-ts 2.x
- **Git Conventions:** Conventional Commits via commitlint
- **Node Version:** >= 22

## Project Structure

```
ts-endpoint/
├── packages/              # Core monorepo packages
│   ├── core/             # Core endpoint definitions (@ts-endpoint/core)
│   ├── express/          # Express.js adapter (@ts-endpoint/express)
│   ├── http-client/      # HTTP client implementation (@ts-endpoint/http-client)
│   ├── react-admin/      # React Admin integration (@ts-endpoint/react-admin)
│   ├── resource-client/  # Resource client utilities (@ts-endpoint/resource-client)
│   ├── tanstack-query/   # TanStack Query integration (@ts-endpoint/tanstack-query)
│   └── test/             # Testing utilities (@ts-endpoint/test)
├── examples/             # Example implementations
│   └── react-express/    # Full-stack React + Express example
├── website/              # Documentation site (Docusaurus)
├── scripts/              # Build and release scripts
└── coverage/             # Test coverage reports
```

### Key Package Locations

- **Source Code:** `packages/*/src/` - All TypeScript source files
- **Tests:** `packages/*/src/__test__/` - Unit tests (`.spec.ts`)
- **Type Tests:** `packages/*/src/__typetests__/` - Type-level tests (`.test-d.ts`)
- **Build Output:** `packages/*/lib/` - Compiled JavaScript (git-ignored)
- **Documentation:** `website/docs/` - Markdown documentation files

## Commands You Can Use

### Core Development Commands

**Install dependencies:**
```bash
pnpm install
```

**Build all packages:**
```bash
pnpm build:packages
```

**Build specific package:**
```bash
pnpm core build          # Build @ts-endpoint/core
pnpm express build       # Build @ts-endpoint/express
pnpm http-client build   # Build @ts-endpoint/http-client
```

**Run tests:**
```bash
pnpm test               # Run all tests with coverage
pnpm test:spec          # Run only spec tests
pnpm test:typecheck     # Run type-checking tests
```

**Linting and formatting:**
```bash
pnpm lint               # Lint all packages
pnpm typecheck          # Type-check all packages
```

**Clean build artifacts:**
```bash
pnpm clean              # Remove all build outputs
```

### Documentation Commands

**Build documentation site:**
```bash
pnpm website build
```

**Run documentation dev server:**
```bash
pnpm website start
```

## Code Style and Standards

### TypeScript Conventions

**Naming:**
- **Interfaces/Types:** PascalCase (`Endpoint`, `HTTPMethod`, `RecordCodec`)
- **Functions:** camelCase (`getPath`, `addSlash`, `Endpoint`)
- **Constants:** UPPER_SNAKE_CASE for true constants
- **Type parameters:** Single uppercase letters or PascalCase (`M`, `O`, `RecordCodec`)

**Import Style:**
```typescript
// ✅ GOOD - Use type imports with inline syntax
import { type Either } from 'fp-ts/lib/Either.js';
import * as R from 'fp-ts/lib/Record.js';
import { pipe } from 'fp-ts/lib/function.js';

// ✅ GOOD - Always include .js extension for local imports
import { addSlash } from './helpers.js';
import { type Codec } from './Codec.js';

// ❌ BAD - Missing type keyword for type-only imports
import { Either } from 'fp-ts/lib/Either.js';

// ❌ BAD - Missing .js extension
import { addSlash } from './helpers';
```

**Import Ordering:**
Alphabetical order enforced by ESLint. Group by:
1. External dependencies (fp-ts, io-ts, effect)
2. Internal package imports
3. Relative imports

### Functional Programming Patterns

This project heavily uses **fp-ts** for functional programming. Follow these patterns:

```typescript
// ✅ GOOD - Use pipe for data transformations
import { pipe } from 'fp-ts/lib/function.js';
import * as R from 'fp-ts/lib/Record.js';

const result = pipe(
  record,
  R.map(transform),
  R.filter(predicate)
);

// ✅ GOOD - Use TaskEither for async operations with error handling
import * as TE from 'fp-ts/lib/TaskEither.js';

const fetchUser = (id: string): TE.TaskEither<Error, User> => 
  pipe(
    TE.tryCatch(
      () => api.get(`/users/${id}`),
      (error) => new Error(String(error))
    ),
    TE.map((response) => response.data)
  );

// ✅ GOOD - Use Either for synchronous operations with error handling
import * as E from 'fp-ts/lib/Either.js';

const parseUser = (data: unknown): E.Either<Error, User> =>
  pipe(
    UserCodec.decode(data),
    E.mapLeft((errors) => new Error('Validation failed'))
  );
```

### Testing Patterns

```typescript
// ✅ GOOD - Clear test structure with vitest
import { describe, expect, it } from 'vitest';
import { Schema } from 'effect';
import { Endpoint } from '../Endpoint.js';

describe('Endpoint', () => {
  const endpoint = Endpoint({
    Input: {
      Query: Schema.Struct({ color: Schema.String }),
      Params: Schema.Struct({ id: Schema.Number }),
    },
    Method: 'GET',
    getPath: ({ id }) => `users/${id.toString()}/crayons`,
    Output: Schema.Struct({ crayons: Schema.Array(Schema.String) }),
  });

  it('generates correct path with params', () => {
    expect(endpoint.getPath({ id: 3 })).toEqual('/users/3/crayons');
  });

  it('generates correct static path', () => {
    expect(endpoint.getStaticPath((param) => `:${param}`))
      .toEqual('/users/:id/crayons');
  });
});
```

### Error Handling

```typescript
// ✅ GOOD - Define typed error responses
export type EndpointErrors<S extends string, B extends Codec<any, any>> = 
  Record<S, B>;

// ✅ GOOD - Use Either for validation errors
const validated = codec.decode(input);
if (E.isLeft(validated)) {
  // Handle validation error
}

// ❌ AVOID - Throwing unchecked exceptions
throw new Error('Invalid input'); // Use Either/TaskEither instead
```

### TypeScript Configuration Rules

- **Strict mode:** Always enabled
- **No implicit any:** Warn only (being phased to error)
- **Unused vars:** Currently disabled but should be avoided
- **Explicit return types:** Prefer explicit types on public APIs
- **ESNext features:** Target ESNext, use modern JavaScript/TypeScript

## Package-Specific Guidelines

### @ts-endpoint/core
- Core endpoint definitions and types
- No framework dependencies
- Pure TypeScript with fp-ts utilities
- Must maintain backward compatibility

### @ts-endpoint/express
- Express.js-specific adapters
- Route handlers must be type-safe
- Follow Express middleware patterns

### @ts-endpoint/http-client
- HTTP client implementations
- Handle network errors with TaskEither
- Support both fetch and other HTTP libraries

### @ts-endpoint/react-admin & @ts-endpoint/tanstack-query
- React-specific integrations
- Follow React hooks conventions
- Handle loading/error states properly

## Git Workflow

### Commit Messages
Follow **Conventional Commits** spec (enforced by commitlint):

```bash
# ✅ GOOD commits
feat(core): add support for custom headers
fix(express): correct route parameter parsing
docs(readme): update installation instructions
chore(deps): upgrade TypeScript to 5.8
test(http-client): add tests for error handling
refactor(core): simplify endpoint type inference

# ❌ BAD commits
Updated stuff
Fix bug
WIP
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Scopes:** Package names (`core`, `express`, `http-client`, etc.) or general areas

### Branch Strategy
- Main branch: `master`
- Feature branches: `feat/*` or `feature/*`
- Current development: `feat/v3` (version 3 migration)

### Pull Requests
- Must pass all tests (`pnpm test`)
- Must pass linting (`pnpm lint`)
- Must pass type-checking (`pnpm typecheck`)
- Coverage thresholds: 80% lines, statements, branches
- Conventional commits required

## Boundaries

### ✅ Always Do
- Run tests before committing (`pnpm test`)
- Follow conventional commit format
- Use type imports with `type` keyword where appropriate
- Include `.js` extensions in imports
- Maintain test coverage above 80%
- Use fp-ts patterns for functional code (pipe, Either, TaskEither)
- Add tests for new features in `__test__/` directories
- Update documentation when changing public APIs
- Use strict TypeScript settings
- Sort imports alphabetically

### ⚠️ Ask First
- Adding new dependencies to any package
- Changing public API signatures (breaking changes)
- Modifying build configuration (tsconfig, vitest, eslint)
- Changing package versions
- Modifying CI/CD workflows in `.github/workflows/`
- Large refactors affecting multiple packages
- Changes to the monorepo structure

### 🚫 Never Do
- Commit to `master` directly (use PRs)
- Disable TypeScript strict mode
- Use `any` type without justification
- Commit build artifacts (`lib/`, `coverage/`, `node_modules/`)
- Commit secrets, API keys, or tokens (except `gh-token.txt` if intended)
- Modify `node_modules/` or `pnpm-lock.yaml` manually
- Remove or reduce test coverage
- Use `console.log` in source code (ESLint error)
- Skip linting or type-checking
- Use module imports instead of lib imports for fp-ts (see ESLint config)
- Mix CommonJS and ESM syntax

## Documentation Standards

When writing documentation:
- Use clear, concise language
- Provide working code examples
- Follow the existing structure in `website/docs/`
- Include type signatures for public APIs
- Explain both the "what" and the "why"
- Link to related documentation
- Use proper Markdown formatting

## Common Patterns

### Defining an Endpoint

```typescript
import { Schema } from 'effect';
import { Endpoint } from '@ts-endpoint/core';

const GetUser = Endpoint({
  Method: 'GET',
  getPath: ({ id }) => `users/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.Number }),
    Headers: Schema.Struct({ 'Authorization': Schema.String }),
  },
  Output: Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    email: Schema.String,
  }),
  Errors: {
    404: Schema.Struct({ message: Schema.String }),
    401: Schema.Struct({ error: Schema.String }),
  },
});
```

### Using pipe for Transformations

```typescript
import { pipe } from 'fp-ts/lib/function.js';
import * as A from 'fp-ts/lib/Array.js';
import * as O from 'fp-ts/lib/Option.js';

const result = pipe(
  users,
  A.filter((u) => u.active),
  A.map((u) => u.name),
  A.head,
  O.getOrElse(() => 'No active users')
);
```

## Additional Resources

- **Documentation:** https://ts-endpoint.federicosordillo.com
- **Repository:** https://github.com/fes300/ts-endpoint (or ascariandrea/ts-endpoint)
- **Examples:** See `examples/react-express/` for full-stack implementation
- **fp-ts Documentation:** https://gcanti.github.io/fp-ts/
- **io-ts Documentation:** https://gcanti.github.io/io-ts/
- **Effect Schema:** https://effect.website/docs/schema/introduction

## Quick Reference

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Build all | `pnpm build` |
| Test | `pnpm test` |
| Lint | `pnpm lint` |
| Type-check | `pnpm typecheck` |
| Clean | `pnpm clean` |
| Build docs | `pnpm website build` |

---

**Remember:** This is a type-safe, functional programming library. When in doubt, favor type safety, immutability, and explicit error handling using fp-ts patterns.
