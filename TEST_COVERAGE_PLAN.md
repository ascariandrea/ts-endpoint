# Test Coverage Analysis & Improvement Plan

## Current State Overview

### Spec Tests (Unit Tests)

| Package | Files | Tests | Status |
|---------|-------|-------|--------|
| `@ts-endpoint/core` | 3 | 5 | Good |
| `@ts-endpoint/express` | 1 | 3 | Partial |
| `@ts-endpoint/http-client` | 1 | 20 | Comprehensive |
| `@ts-endpoint/react-admin` | 1 | 1 | Minimal |
| `@ts-endpoint/resource-client` | 1 | 1 | Minimal |
| `@ts-endpoint/tanstack-query` | 3 | 10 | Good |

**Total: 10 spec files, 40 tests**

### Type Tests

| Package | Files | Tests | Folder |
|---------|-------|-------|--------|
| `@ts-endpoint/core` | 8 | 8 | `__typetests__` |
| `@ts-endpoint/express` | 2 | 4 | `__typetests__` |
| `@ts-endpoint/http-client` | 2 | 2 | `__typetests__` |
| `@ts-endpoint/react-admin` | 1 | 0 | `__typetests__` |
| `@ts-endpoint/resource-client` | 1 | 2 | `__typetest__` |
| `@ts-endpoint/tanstack-query` | 3 | 5 | `__typetest__` |

**Total: 17 type test files, 21 type tests**

---

## Test File Inventory

### Spec Tests

```
packages/core/src/__test__/
├── endpoint.spec.ts     (3 tests)
├── codec.spec.ts        (1 test)
└── error.spec.ts        (1 test)

packages/express/src/__test__/
└── express.spec.ts      (3 tests)

packages/http-client/src/__test__/
└── fetch.spec.ts        (20 tests)

packages/react-admin/src/__test__/
└── RAEndpointsClient.spec.ts  (1 test)

packages/resource-client/src/__test__/
└── ResourceClient.spec.ts     (1 test)

packages/tanstack-query/src/__test__/
├── QueryProvider.effect.spec.ts  (4 tests)
├── GetQueries.spec.ts            (5 tests)
└── params.spec.ts                (1 test)
```

### Type Tests

```
packages/core/src/__typetests__/
├── endpoint.test-d.ts
├── endpoint.effect.test-d.ts
├── endpointInstance.effect.test-d.ts
├── codec.effect.test-d.ts
├── codec.io-ts.test-d.ts
├── helpers.test-d.ts
├── helpers.effect.test-d.ts
└── ResourceEndpoints.effect.test-d.ts

packages/express/src/__typetests__/
├── addEndpoint.effect.test-d.ts
└── addEndpoint.io-ts.test-d.ts

packages/http-client/src/__typetests__/
├── fetch.effect.test-d.ts
└── fetch.io-ts.test-d.ts

packages/react-admin/src/__typetests__/
└── RAEndpointsClient.test-d.ts  (0 tests - empty)

packages/resource-client/src/__typetest__/
└── ResourceClient.test-d.ts

packages/tanstack-query/src/__typetest__/
├── QueryProvider.test-d.ts
├── GetQueries.test-d.ts
└── types.test-d.ts
```

---

## Gap Analysis

### High Priority

#### 1. `@ts-endpoint/express` - Needs More Spec Tests
**Current:** 3 tests covering basic functionality
**Missing:**
- [ ] Input validation errors (params, query, body, headers)
- [ ] Error response handling (known errors with status codes)
- [ ] Content-type handling
- [ ] Response encoding

#### 2. `@ts-endpoint/react-admin` - Needs Both Spec and Type Tests
**Current:** 1 spec test (existence check), 0 type tests
**Missing spec tests:**
- [ ] `getOne` with actual API call
- [ ] `getList` with pagination and filters
- [ ] `create`, `update`, `delete` operations
- [ ] Error handling scenarios
- [ ] Custom endpoint handling

**Missing type tests:**
- [ ] Populate `RAEndpointsClient.test-d.ts` with actual type assertions

#### 3. `@ts-endpoint/resource-client` - Needs More Spec Tests
**Current:** 1 spec test (existence check)
**Missing:**
- [ ] CRUD operations with mocked client
- [ ] Parameter transformation
- [ ] Error handling for each operation

### Medium Priority

#### 4. `@ts-endpoint/core` - Could Use More Coverage
**Current:** 5 tests across 3 files
**Potential additions:**
- [ ] More codec edge cases
- [ ] ResourceEndpoint spec tests
- [ ] Additional error class tests

#### 5. `@ts-endpoint/tanstack-query` - Good But Could Expand
**Current:** 10 tests across 3 files
**Potential additions:**
- [ ] QueryProviderOverrides behavior
- [ ] Edge cases in params serialization

### Low Priority

#### 6. Folder Naming Inconsistency
Two packages use `__typetest__` instead of `__typetests__`:
- `packages/resource-client/src/__typetest__/`
- `packages/tanstack-query/src/__typetest__/`

Consider standardizing to `__typetests__` for consistency.

---

## Implementation Plan

### Phase 1: Critical Gaps

#### Task 1.1: Expand `@ts-endpoint/express` spec tests
**File:** `packages/express/src/__test__/express.spec.ts`

Add tests for:
1. Validation error handling (400 responses)
2. Known error responses with correct status codes
3. Headers validation and extraction
4. Response content-type handling
5. Successful response encoding

#### Task 1.2: Populate `@ts-endpoint/react-admin` type tests
**File:** `packages/react-admin/src/__typetests__/RAEndpointsClient.test-d.ts`

Add assertions for:
1. Method return types
2. Input parameter type safety
3. Custom endpoint type inference

#### Task 1.3: Expand `@ts-endpoint/react-admin` spec tests
**File:** `packages/react-admin/src/__test__/RAEndpointsClient.spec.ts`

Add tests for:
1. Actual CRUD operations with mocked fetch
2. Request/response transformation
3. Error scenarios

### Phase 2: Coverage Expansion

#### Task 2.1: Expand `@ts-endpoint/resource-client` spec tests
**File:** `packages/resource-client/src/__test__/ResourceClient.spec.ts`

Add tests for:
1. Each CRUD operation
2. Custom endpoints
3. Error handling

#### Task 2.2: Add more `@ts-endpoint/core` tests
Consider adding:
1. ResourceEndpoint spec tests
2. Additional codec edge cases

### Phase 3: Cleanup

#### Task 3.1: Standardize type test folder names
Rename `__typetest__` to `__typetests__` in:
- `packages/resource-client/`
- `packages/tanstack-query/`

Update vitest configs accordingly.

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run spec tests only
pnpm test:spec

# Run type tests only
pnpm test:typecheck

# Run specific test file
pnpm vitest packages/express/src/__test__/express.spec.ts

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm vitest --watch
```

## Coverage Threshold

Configuration requires **80%** coverage for:
- Lines
- Statements
- Branches

Excluded from coverage: `lib/`, `index.ts`, test files, examples, website.
