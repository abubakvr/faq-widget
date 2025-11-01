# Testing Guide

This directory contains comprehensive tests for the Chat Widget SDK.

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Test setup and global mocks
│   └── mocks/
│       └── api.ts            # API response mocks
├── components/
│   └── __tests__/
│       ├── Widget.test.tsx   # Main Widget component tests
│       └── MessageBubble.test.tsx  # MessageBubble component tests
├── utils/
│   └── __tests__/
│       └── api.test.ts       # API client tests
└── hooks/
    └── __tests__/
        └── useTypewriter.test.ts  # Typewriter hook tests
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm test -- --watch
```

### Run tests with UI

```bash
npm run test:ui
```

### Run tests once (CI mode)

```bash
npm run test:run
```

### Generate coverage report

```bash
npm run test:coverage
```

## Test Coverage

### Widget Component (`Widget.test.tsx`)

- ✅ Rendering and initial state
- ✅ Modal opening and closing
- ✅ Welcome message display and persistence
- ✅ Message sending and input handling
- ✅ API integration
- ✅ Follow-up questions
- ✅ Customization props (colors, text size, titles, etc.)
- ✅ Session management
- ✅ Error handling
- ✅ Empty states

### MessageBubble Component (`MessageBubble.test.tsx`)

- ✅ Rendering user and assistant messages
- ✅ Typewriter effect
- ✅ Follow-up question display and interaction
- ✅ Styling and customization

### API Client (`api.test.ts`)

- ✅ Constructor and initialization
- ✅ askQuestion method
- ✅ getSessionInfo method
- ✅ healthCheck method
- ✅ Error handling

### useTypewriter Hook (`useTypewriter.test.ts`)

- ✅ Initialization
- ✅ Progressive character display
- ✅ Completion state
- ✅ Speed control
- ✅ Text changes

## Test Utilities

### Mocks

**API Mocks** (`src/test/mocks/api.ts`)

- `mockAskQuestionResponse`: Successful API response with follow-up question
- `mockAskQuestionResponseNoFollowUp`: Successful API response without follow-up
- `mockErrorResponse`: Error API response
- `createMockFetch`: Helper to create fetch mocks

### Setup

**Test Setup** (`src/test/setup.ts`)

- Configures `@testing-library/jest-dom` matchers
- Sets up cleanup after each test
- Mocks `window.matchMedia` and `IntersectionObserver`
- Clears localStorage after each test

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Widget } from "../Widget";

describe("Widget Component", () => {
  const defaultProps = {
    baseUrl: "http://localhost:8080",
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    render(<Widget {...defaultProps} />);
    expect(screen.getByText(/Chat with us/i)).toBeInTheDocument();
  });
});
```

### Best Practices

1. **Use `userEvent` for user interactions** instead of `fireEvent` for more realistic tests
2. **Use `waitFor` for async operations** to handle state updates
3. **Mock external dependencies** like API calls and browser APIs
4. **Clean up after each test** (handled in setup.ts)
5. **Use descriptive test names** that explain what is being tested
6. **Group related tests** using `describe` blocks

### Common Patterns

#### Testing async operations

```typescript
it("should handle async operations", async () => {
  const user = userEvent.setup();
  render(<Widget {...defaultProps} />);

  await user.click(screen.getByRole("button"));

  await waitFor(() => {
    expect(screen.getByText("Expected result")).toBeInTheDocument();
  });
});
```

#### Mocking API calls

```typescript
beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)
  );
});
```

#### Testing with timers

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("should handle timers", () => {
  const { result } = renderHook(() =>
    useTypewriter({ text: "Hello", speed: 50 })
  );

  act(() => {
    vi.advanceTimersByTime(50);
  });

  expect(result.current.displayedText).toBe("H");
});
```

## Debugging Tests

### Run a specific test file

```bash
npm test -- Widget.test.tsx
```

### Run tests matching a pattern

```bash
npm test -- -t "should render"
```

### Debug mode

```bash
npm test -- --inspect-brk
```

### Verbose output

```bash
npm test -- --reporter=verbose
```

## CI/CD Integration

Tests are configured to run in CI environments. The `test:run` script runs tests once without watch mode, suitable for CI pipelines.

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:run
```
