# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ts-endpoint** is a TypeScript monorepo for type-safe endpoint definitions shared between clients and servers. It uses `effect/Schema` (and io-ts for legacy support) for runtime validation and `fp-ts` for functional programming patterns.

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build:packages

# Build specific package
pnpm core build          # @ts-endpoint/core
pnpm express build       # @ts-endpoint/express
pnpm http-client build   # @ts-endpoint/http-client

# Run tests
pnpm test               # All tests with coverage
pnpm test:spec          # Spec tests only
pnpm test:typecheck     # Type-checking tests

# Run single test file
pnpm vitest packages/core/src/__test__/Endpoint.spec.ts

# Lint and typecheck
pnpm lint
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Architecture

### Package Dependency Flow
```
@ts-endpoint/core (foundation - pure TypeScript + fp-ts)
    ↓
@ts-endpoint/express (server adapter)
@ts-endpoint/http-client (client implementation)
    ↓
@ts-endpoint/tanstack-query (React hooks)
@ts-endpoint/react-admin (React Admin integration)
@ts-endpoint/resource-client (resource utilities)
```

### Key Abstractions

**Endpoint**: Core type representing an HTTP endpoint with typed params, query, body, headers, output, and errors. Defined once, used everywhere.

**Codec**: Abstraction over `effect/Schema` and `io-ts` types. All input/output types are Codecs for runtime validation.

**EndpointInstance**: Runtime representation with `getPath()` (builds path with params) and `getStaticPath()` (builds route pattern like `/users/:id`).

**GetEndpointSubscriber** (express): Creates type-safe Express route handlers that auto-validate inputs and handle responses.

**GetHTTPClient** (http-client): Creates type-safe fetch clients from endpoint definitions. Returns `ReaderTaskEither` for composable async error handling.

### fp-ts Patterns Used Throughout
- `pipe()` for data transformations
- `Either` for sync error handling (validation)
- `TaskEither` for async error handling (HTTP calls)
- `ReaderTaskEither` for dependency injection + async

## Code Conventions

### Imports
```typescript
// Always use .js extension for local imports
import { addSlash } from './helpers.js';
import { type Codec } from './Codec.js';

// Use type imports with inline syntax
import { type Either } from 'fp-ts/lib/Either.js';
import * as E from 'fp-ts/lib/Either.js';
```

### Testing
- Unit tests: `packages/*/src/__test__/*.spec.ts`
- Type tests: `packages/*/src/__typetests__/*.test-d.ts`
- Coverage threshold: 80% lines/statements/branches

### Commits
Follow Conventional Commits: `feat(core):`, `fix(express):`, `docs:`, `chore:`, etc.

## Boundaries

### Ask Before
- Adding new dependencies
- Changing public API signatures
- Modifying build/lint/test configuration
- Changes affecting multiple packages

### Avoid
- Using `any` without justification
- `console.log` in source code (ESLint error)
- Module imports for fp-ts (use lib imports: `fp-ts/lib/Either.js`)
- Missing `.js` extensions in imports
