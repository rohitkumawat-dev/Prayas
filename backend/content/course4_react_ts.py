"""Theory + module quizzes: React & TypeScript Mastery."""

LESSONS = {
"TypeScript Setup and Configuration": """# TypeScript Setup and Configuration

## What TypeScript is
TypeScript is JavaScript with **static types**. The compiler checks your code before it runs and then emits plain JavaScript. Types are erased at runtime; they exist to catch mistakes early and power editor tooling (autocomplete, safe refactoring).

## Getting started
```bash
npm install -D typescript
npx tsc --init          # creates tsconfig.json
npx tsc                 # type-check and compile
```
With Vite: `npm create vite@latest my-app -- --template react-ts`.

## Important tsconfig options
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```
- **`strict: true`** enables the whole family of strict checks (`strictNullChecks`, `noImplicitAny`, and more). Always turn it on for new projects.
- **`paths`** defines import aliases such as `@/components/Button`.

## Type annotations vs inference
```typescript
let count: number = 0;        // explicit
let title = "Course";         // inferred as string
function add(a: number, b: number): number { return a + b; }
```
Let inference work for local variables; annotate function parameters and public APIs.

## Type packages
Libraries without built-in types use `@types/*` packages (e.g. `npm i -D @types/node`).

> **Key takeaway:** enable `strict` from day one and let the compiler be your first reviewer.""",

"Types, Interfaces, and Generics": """# Types, Interfaces, and Generics

## Primitives and special types
`string`, `number`, `boolean`, `null`, `undefined`, plus:
- **`any`**: opts out of checking (avoid).
- **`unknown`**: a safe "anything" that must be narrowed before use.
- **`never`**: a value that cannot occur.

## Object shapes
```typescript
interface User {
  id: number;
  name: string;
  email?: string;        // optional
  readonly role: "trainee" | "trainer" | "admin";
}

type Point = { x: number; y: number };
```
**Interface vs type:** both describe objects. Interfaces can be extended and merged; `type` aliases can also express unions, intersections and primitives. Either is fine; be consistent.

## Union and literal types
```typescript
type Status = "idle" | "loading" | "success" | "error";
function show(id: number | string) { /* ... */ }
```

## Narrowing
```typescript
function format(value: string | number) {
  if (typeof value === "string") return value.toUpperCase();
  return value.toFixed(2);
}
```

## Generics
Generics let one definition work with many types while staying type-safe.
```typescript
function first<T>(items: T[]): T | undefined { return items[0]; }
const n = first([1, 2, 3]);       // number | undefined

interface ApiResponse<T> { data: T; message: string; }
```
Constrain with `extends`: `function getId<T extends { id: number }>(x: T) { return x.id; }`.

> **Key takeaway:** model your data with precise types; use unions for "one of" and generics for reusable logic.""",

"Advanced TypeScript Patterns": """# Advanced TypeScript Patterns

## Utility types
```typescript
interface Course { id: number; title: string; hours: number; }

type CourseDraft   = Partial<Course>;             // all optional
type CourseSummary = Pick<Course, "id" | "title">;
type NoHours       = Omit<Course, "hours">;
type Frozen        = Readonly<Course>;
type ById          = Record<number, Course>;
```

## Discriminated unions
Give each variant a common literal field so the compiler can narrow precisely.
```typescript
type Result =
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function render(r: Result) {
  if (r.status === "success") return r.data.join(", ");
  return r.message;
}
```
Add an exhaustive check with `never` to be warned when a new variant is added.

## Type guards
```typescript
function isString(x: unknown): x is string { return typeof x === "string"; }
```

## Mapped and conditional types
```typescript
type Optional<T> = { [K in keyof T]?: T[K] };
type ElementOf<T> = T extends (infer U)[] ? U : never;
```

## `as const` and `satisfies`
```typescript
const roles = ["admin", "trainer", "trainee"] as const;
type Role = typeof roles[number];      // "admin" | "trainer" | "trainee"
```

## Runtime validation
Types vanish at runtime, so validate external data (API responses, forms) with a library such as **Zod** and infer the type from the schema: `type User = z.infer<typeof UserSchema>`.

> **Key takeaway:** discriminated unions and utility types eliminate whole classes of bugs without extra runtime code.""",

"Typed Components and Props": """# Typed Components and Props

## Typing props
```tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Button({ label, variant = "primary", disabled, onClick }: ButtonProps) {
  return <button className={variant} disabled={disabled} onClick={onClick}>{label}</button>;
}
```
Prefer a plain function with typed props over `React.FC`.

## Children
```tsx
interface CardProps { title: string; children: React.ReactNode; }
```

## Extending native elements
```tsx
type InputProps = React.ComponentPropsWithoutRef<"input"> & { label: string };
function Field({ label, ...rest }: InputProps) {
  return <label>{label}<input {...rest} /></label>;
}
```

## Events
`React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`, `React.KeyboardEvent`.
```tsx
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
```

## Generic components
```tsx
interface ListProps<T> { items: T[]; render: (item: T) => React.ReactNode; }
function List<T>({ items, render }: ListProps<T>) {
  return <ul>{items.map((it, i) => <li key={i}>{render(it)}</li>)}</ul>;
}
```

## Refs and forwarding
`useRef<HTMLInputElement>(null)` gives a correctly typed DOM reference.

> **Key takeaway:** typed props act as living documentation and catch wrong usage at compile time.""",

"Typed Hooks and Context": """# Typed Hooks and Context

## useState
```tsx
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);   // otherwise inferred as never[]
```
Provide the generic when the initial value does not describe the full type.

## useRef, useReducer
```tsx
const timer = useRef<number | null>(null);

type Action = { type: "add"; item: string } | { type: "clear" };
function reducer(state: string[], action: Action): string[] {
  switch (action.type) {
    case "add":   return [...state, action.item];
    case "clear": return [];
  }
}
```

## Typed context
```tsx
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```
The `undefined` default plus a guard hook means consumers always receive a non-null value.

## Custom hooks with generics
```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData).catch(e => setError(String(e)));
  }, [url]);
  return { data, error };
}
```

> **Key takeaway:** give state and context precise types, and expose them through small guarded hooks.""",

"Type-safe Routing": """# Type-safe Routing

## React Router basics
```tsx
<Routes>
  <Route path="/courses" element={<CourseList />} />
  <Route path="/courses/:id" element={<CourseDetail />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Typed params
`useParams` returns strings that may be undefined. Validate and convert them.
```tsx
const { id } = useParams<{ id: string }>();
const courseId = Number(id);
if (!id || Number.isNaN(courseId)) return <NotFound />;
```

## Typed navigation and state
```tsx
const navigate = useNavigate();
navigate(`/courses/${course.id}`, { state: { from: "catalog" } });
```
Centralise paths in one place to avoid typos:
```typescript
export const paths = {
  course: (id: number) => `/courses/${id}`,
  quiz: (id: number) => `/quizzes/${id}`,
} as const;
```

## Search params
Use `useSearchParams` and parse values defensively (`Number(params.get("page") ?? 1)`).

## Protected routes
```tsx
function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? <>{children}</> : <Navigate to="/" replace />;
}
```

## Data routers
Frameworks like TanStack Router generate fully typed route definitions so invalid links fail at compile time.

> **Key takeaway:** URL values are untyped input; validate them, centralise route builders and guard private pages.""",

"Context API Patterns": """# Context API Patterns

## The problem context solves
**Prop drilling** means passing props through many layers that do not use them. Context makes a value available to any descendant without threading it through every level.

## Pattern: provider + hook
```tsx
const ThemeContext = createContext<"light" | "dark">("light");

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

## Performance considerations
Every consumer re-renders when the context value changes. To limit this:
- Memoise the value object.
- **Split contexts** by concern (state vs dispatch, or auth vs theme).
- Keep frequently changing data (like input text) out of context.

## Context + useReducer
Combine them for predictable, testable updates without a library:
```tsx
const [state, dispatch] = useReducer(reducer, initial);
```

## When to use context
Good: theme, current user, locale, feature flags. Poor: rapidly changing or large data sets; use a state library or server-state tool.

## Testing
Wrap components in the provider in tests, or expose a `renderWithProviders` helper.

> **Key takeaway:** context is for low-frequency, widely shared values; split it and memoise to avoid needless re-renders.""",

"Redux with TypeScript": """# Redux with TypeScript

## Why Redux?
Redux keeps application state in one store with predictable updates: state changes only through dispatched **actions** handled by **reducers**. It shines for large apps with complex shared state and time-travel debugging.

## Redux Toolkit (RTK)
RTK is the modern, recommended way to write Redux: less boilerplate, Immer built in (you may "mutate" draft state safely).

```typescript
import { createSlice, PayloadAction, configureStore } from "@reduxjs/toolkit";

interface CartState { items: { id: number; qty: number }[]; }
const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    added(state, action: PayloadAction<number>) {
      const found = state.items.find(i => i.id === action.payload);
      if (found) found.qty += 1;
      else state.items.push({ id: action.payload, qty: 1 });
    },
    cleared: () => initialState,
  },
});

export const { added, cleared } = cartSlice.actions;
export const store = configureStore({ reducer: { cart: cartSlice.reducer } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Typed hooks
```typescript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## Async logic
`createAsyncThunk` handles pending, fulfilled and rejected states; **RTK Query** adds caching and data fetching.

## Rules
Keep state serialisable, put derived data in **selectors**, and keep reducers pure.

> **Key takeaway:** use Redux Toolkit with typed hooks; it gives predictable state for large, shared data.""",

"Server State with React Query": """# Server State with React Query

## Client state vs server state
**Client state** lives in the browser (modal open, form input). **Server state** is remote data you do not own: it can become stale, needs caching, retries and synchronisation. TanStack Query (React Query) is built for server state.

## Fetching
```tsx
import { useQuery } from "@tanstack/react-query";

function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async (): Promise<Course[]> => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 60_000,
  });
}

const { data, isPending, isError, error } = useCourses();
```
The **query key** identifies cached data; include every variable the query depends on (`["course", id]`).

## Mutations
```tsx
const qc = useQueryClient();
const enroll = useMutation({
  mutationFn: (courseId: number) => api.post(`/courses/${courseId}/enroll`),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
});
```
**Invalidation** marks cached data stale so it refetches.

## Built-in features
Caching, background refetching, retries with backoff, request deduplication, pagination and infinite queries, and optimistic updates.

## staleTime vs gcTime
`staleTime` is how long data is considered fresh; `gcTime` is how long unused data stays in memory.

> **Key takeaway:** do not put fetched data in Redux or useState by hand; let a server-state library manage caching and freshness.""",

"Unit Testing with Vitest": """# Unit Testing with Vitest

## Why test?
Tests protect against regressions, document behaviour and let you refactor confidently. The **testing pyramid**: many fast unit tests, fewer integration tests, few end-to-end tests.

## Setup
```bash
npm i -D vitest
```
```json
{ "scripts": { "test": "vitest", "coverage": "vitest run --coverage" } }
```

## Writing tests
```typescript
import { describe, it, expect } from "vitest";
import { average } from "./stats";

describe("average", () => {
  it("returns the mean of numbers", () => {
    expect(average([2, 4, 6])).toBe(4);
  });
  it("returns 0 for an empty list", () => {
    expect(average([])).toBe(0);
  });
});
```
Follow **Arrange, Act, Assert**. Test behaviour, not implementation details.

## Common matchers
`toBe`, `toEqual`, `toBeTruthy`, `toContain`, `toThrow`, `toHaveBeenCalledWith`.

## Mocks and spies
```typescript
import { vi } from "vitest";
const fn = vi.fn().mockReturnValue(42);
vi.spyOn(api, "get").mockResolvedValue({ data: [] });
```
Mock external boundaries (network, time, random), not the code under test.

## Good tests are
Fast, isolated, deterministic and readable. Avoid tests that depend on order or on the real network.

> **Key takeaway:** small, focused unit tests on pure logic give the fastest and cheapest feedback.""",

"Component Testing": """# Component Testing

## Testing Library philosophy
React Testing Library encourages testing components **the way users use them**: find elements by role or text, interact, and assert on what is visible, instead of inspecting internal state.

## Example
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

it("increments when clicked", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole("button", { name: /increment/i }));

  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

## Query priority
1. `getByRole` (best; also checks accessibility)
2. `getByLabelText`
3. `getByText`
4. `getByTestId` (last resort)

## getBy, queryBy, findBy
- `getBy*` throws if not found.
- `queryBy*` returns null (use to assert absence).
- `findBy*` waits asynchronously.

## Testing async UI
```tsx
expect(await screen.findByText("Courses loaded")).toBeInTheDocument();
```
Mock the network with **MSW** (Mock Service Worker) so tests exercise real fetch code.

## Testing context and routing
Wrap the component in the necessary providers or `MemoryRouter`.

## Avoid
Snapshot tests of large trees, testing implementation details, and `act` warnings ignored instead of understood.

> **Key takeaway:** if a test breaks when you rename an internal variable but behaviour is unchanged, it is testing the wrong thing.""",

"E2E Testing with Playwright": """# E2E Testing with Playwright

## What E2E tests do
End-to-end tests drive a real browser through complete user journeys (log in, enrol, take a quiz) against a running application. They catch integration problems that unit tests cannot, but they are slower and more brittle, so keep them few and focused on critical flows.

## Setup
```bash
npm init playwright@latest
npx playwright test
npx playwright test --ui      # interactive runner
```

## A test
```typescript
import { test, expect } from "@playwright/test";

test("trainee can log in and see dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("arjun.nair@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
});
```

## Key features
- **Auto-waiting**: actions wait until elements are actionable, reducing flaky tests.
- **Locators** by role, label and text (same philosophy as Testing Library).
- **Multiple browsers**: Chromium, Firefox, WebKit.
- **Trace viewer**, screenshots and video for debugging failures.

## Best practices
- Isolate tests; create their own data.
- Reuse login state via `storageState` to save time.
- Avoid fixed `waitForTimeout`; rely on assertions.
- Run in CI on every pull request.

> **Key takeaway:** cover critical user journeys with a small number of reliable E2E tests and let unit tests handle the details.""",
}

QUIZZES = {
"TypeScript Foundations": [
 ("What does enabling `strict: true` in tsconfig do?", "Minifies the output", "Turns on a family of strict type-checking options", "Disables type checking", "Bundles the app", "b"),
 ("Which type forces you to narrow a value before using it?", "any", "unknown", "void", "object", "b"),
 ("What does `Partial<Course>` produce?", "A type with all properties optional", "A type with all properties required", "Only the id property", "A readonly type", "a"),
 ("What is a discriminated union?", "A union whose members share a literal field used to narrow the type", "A union of numbers only", "A generic constraint", "A class hierarchy", "a"),
 ("Why validate API data at runtime with a tool like Zod?", "TypeScript types are erased at runtime", "Zod is faster than TypeScript", "TypeScript cannot compile JSON", "It replaces React", "a"),
],
"React with TypeScript": [
 ("Which is the correct type for a click handler on a button?", "React.MouseEvent<HTMLButtonElement>", "React.ChangeEvent<HTMLInputElement>", "string", "React.FormEvent", "a"),
 ("Why type `useState<User | null>(null)` explicitly?", "The initial value alone does not describe the full type", "It makes rendering faster", "It is required by React", "It avoids using effects", "a"),
 ("What is the benefit of a guarded `useAuth` hook that throws if the context is undefined?", "Consumers always get a non-null context value", "It speeds up the server", "It removes the need for providers", "It caches API calls", "a"),
 ("`useParams` values in React Router are...", "Always numbers", "Strings that may be undefined and need validating", "Automatically typed by the URL", "Objects", "b"),
 ("Which is generally preferred for typing component props?", "A plain function with a typed props interface", "Untyped props", "Only `any`", "Global variables", "a"),
],
"State Management": [
 ("What problem does React Context primarily solve?", "Slow networks", "Prop drilling", "SQL injection", "CSS conflicts", "b"),
 ("Why can a rapidly changing value in context hurt performance?", "All consumers re-render when the value changes", "Context cannot hold numbers", "It blocks the network", "It disables memoisation forever", "a"),
 ("Redux Toolkit's `createSlice` allows 'mutating' state safely because it uses...", "Immer", "jQuery", "Webpack", "Babel macros only", "a"),
 ("In React Query, what identifies cached data?", "The component name", "The query key", "The CSS class", "The HTTP verb", "b"),
 ("What does invalidating a query do?", "Deletes the component", "Marks cached data stale so it refetches", "Clears the browser", "Logs the user out", "b"),
],
"Testing and Quality": [
 ("Which pattern structures a clean unit test?", "Arrange, Act, Assert", "Read, Write, Execute", "Plan, Do, Check", "Draft, Edit, Publish", "a"),
 ("In Testing Library, which query is preferred first?", "getByTestId", "getByRole", "querySelector", "getByClassName", "b"),
 ("Which query returns null instead of throwing when an element is missing?", "getBy", "findBy", "queryBy", "expectBy", "c"),
 ("What is Playwright's auto-waiting?", "Actions wait until elements are actionable, reducing flaky tests", "It pauses the test for 30 seconds", "It waits for a human", "It retries the whole suite", "a"),
 ("Where should most of your tests sit according to the testing pyramid?", "End-to-end tests", "Unit tests", "Manual tests", "Load tests", "b"),
],
}
