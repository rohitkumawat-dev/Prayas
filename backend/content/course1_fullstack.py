"""Theory + module quizzes: Full-Stack Web Development."""

LESSONS = {
"Introduction to Web Development": """# Introduction to Web Development

## How the web works
Every page you open is the result of a conversation between a **client** (your browser) and a **server**. The browser sends an **HTTP request**; the server replies with an **HTTP response** containing HTML, CSS, JavaScript, images or JSON data.

1. You type a URL such as `https://example.com/courses`.
2. DNS translates the domain name into an IP address.
3. The browser opens a connection and sends a request.
4. The server answers with a status code and a body.
5. The browser renders the response.

## Front end, back end, full stack
- **Front end**: everything the user sees and touches (HTML, CSS, JavaScript, frameworks such as React).
- **Back end**: servers, business logic, databases and APIs that the front end talks to.
- **Full stack**: a developer comfortable in both layers.

## HTTP essentials
| Method | Purpose |
|---|---|
| GET | Read a resource |
| POST | Create a resource |
| PUT / PATCH | Update a resource |
| DELETE | Remove a resource |

Common status codes: `200` OK, `201` Created, `301` Redirect, `400` Bad request, `401` Unauthorized, `404` Not found, `500` Server error.

## The three languages of the front end
HTML gives a page its **structure**, CSS controls its **presentation**, and JavaScript adds **behaviour**. Keeping these concerns separate makes sites easier to maintain.

> **Key takeaway:** the web is a request/response system. Understanding who sends what, and what comes back, is the foundation for every later topic.""",

"HTML Document Structure": """# HTML Document Structure

## What HTML is
HTML (HyperText Markup Language) describes the **meaning and structure** of content using elements written as tags.

## The skeleton of every page
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Page</title>
  </head>
  <body>
    <header><h1>Site title</h1></header>
    <main>
      <article>
        <h2>Heading</h2>
        <p>A paragraph with a <a href="/about">link</a>.</p>
      </article>
    </main>
    <footer>&copy; 2026</footer>
  </body>
</html>
```
The `<head>` holds metadata that is not displayed; the `<body>` holds visible content.

## Semantic elements
Use elements that describe purpose: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`. Semantic markup helps screen readers, search engines and other developers.

## Headings, lists, forms
- Use one `<h1>` per page and do not skip heading levels.
- Lists: `<ul>` (bulleted), `<ol>` (numbered), `<li>` (items).
- Forms use `<form>`, `<label>`, `<input>`, `<select>`, `<textarea>` and `<button>`. Always connect a `<label for="id">` to its input.

## Attributes
Attributes add information to elements: `href`, `src`, `alt`, `class`, `id`. Images need meaningful `alt` text for accessibility.

> **Key takeaway:** write HTML for meaning first. Good structure makes styling, scripting and accessibility much easier.""",

"CSS Styling Basics": """# CSS Styling Basics

## What CSS does
CSS (Cascading Style Sheets) controls colours, fonts, spacing and layout. A rule has a **selector** and **declarations**:

```css
h1 {
  color: #4c1d95;
  font-size: 2rem;
}
```

## Selectors
- Type: `p`
- Class: `.card` (reusable, most common)
- ID: `#header` (unique)
- Descendant: `nav a`
- Pseudo-class: `a:hover`, `li:first-child`

## The cascade and specificity
When rules conflict, the browser chooses using **origin, specificity and source order**. Specificity ranks ID selectors above class selectors, and class selectors above type selectors. Prefer classes and avoid `!important`.

## The box model
Every element is a box made of **content, padding, border and margin**. Setting `box-sizing: border-box` makes `width` include padding and border, which is far easier to reason about.

```css
* { box-sizing: border-box; }
.card {
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
}
```

## Units
`px` is fixed; `rem` scales with the root font size; `%` is relative to the parent; `vw`/`vh` are relative to the viewport.

## Flexbox in one minute
```css
.row { display: flex; gap: 1rem; justify-content: space-between; align-items: center; }
```

> **Key takeaway:** understand the box model and specificity and most "why doesn't my CSS work?" problems disappear.""",

"JavaScript Fundamentals": """# JavaScript Fundamentals

## Variables
Use `const` by default and `let` when a value must change. Avoid `var`.

```javascript
const name = "Asha";
let score = 0;
score += 10;
```

## Data types
Primitives: `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`. Everything else is an **object** (arrays and functions included).

## Functions
```javascript
function add(a, b) { return a + b; }
const multiply = (a, b) => a * b;   // arrow function
```
Functions are values: they can be stored in variables and passed to other functions (callbacks).

## Arrays and objects
```javascript
const nums = [1, 2, 3, 4];
const evens = nums.filter(n => n % 2 === 0);   // [2, 4]
const doubled = nums.map(n => n * 2);          // [2, 4, 6, 8]
const total = nums.reduce((s, n) => s + n, 0); // 10

const user = { name: "Asha", role: "trainee" };
const { name, role } = user;                   // destructuring
```

## Equality and truthiness
Use `===` (strict equality) rather than `==`. Falsy values are `false`, `0`, `""`, `null`, `undefined` and `NaN`.

## Control flow
`if / else`, `switch`, `for`, `for...of`, `while`.

> **Key takeaway:** master `const/let`, arrow functions and the array methods `map`, `filter`, `reduce`; modern JavaScript is built on them.""",

"DOM Manipulation": """# DOM Manipulation

## What the DOM is
The **Document Object Model** is a tree of objects that represents the page. JavaScript can read and change this tree, and the browser updates what the user sees.

## Selecting elements
```javascript
const title = document.querySelector("#title");
const items = document.querySelectorAll(".item");
```
`querySelector` returns the first match; `querySelectorAll` returns all matches.

## Changing content and style
```javascript
title.textContent = "Hello!";
title.classList.add("highlight");
title.setAttribute("aria-live", "polite");
```
Prefer `textContent` over `innerHTML` when inserting user-provided text; `innerHTML` can introduce **XSS** vulnerabilities.

## Creating elements
```javascript
const li = document.createElement("li");
li.textContent = "New task";
document.querySelector("ul").appendChild(li);
```

## Events
```javascript
button.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("clicked");
});
```
**Event delegation**: attach one listener to a parent and check `event.target`, so dynamically added children are handled too.

## Performance tip
Touching the DOM is comparatively expensive. Batch changes, and remember that frameworks like React exist largely to manage DOM updates efficiently.

> **Key takeaway:** select, change, listen. Those three verbs cover most DOM work.""",

"Async JavaScript": """# Async JavaScript

## Why asynchronous code?
JavaScript runs on a single thread. Slow work such as network requests must not block the page, so it is handled **asynchronously** and the result arrives later.

## The event loop
Synchronous code runs first. Finished async tasks queue their callbacks; the event loop runs them when the call stack is empty. **Promise** callbacks (microtasks) run before timer callbacks (macrotasks).

## Promises
A Promise is in one of three states: **pending**, **fulfilled** or **rejected**.
```javascript
fetch("/api/courses")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## async / await
`async/await` is syntax that makes Promise code read top to bottom.
```javascript
async function loadCourses() {
  try {
    const res = await fetch("/api/courses");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.error("Failed:", err);
  }
}
```
Note that `fetch` only rejects on network failure; you must check `res.ok` for HTTP errors.

## Running things in parallel
```javascript
const [users, courses] = await Promise.all([getUsers(), getCourses()]);
```
`Promise.all` waits for every promise and fails fast if any rejects.

> **Key takeaway:** use `async/await` with `try/catch`, check `res.ok`, and use `Promise.all` for independent requests.""",

"Getting Started with React": """# Getting Started with React

## What React is
React is a JavaScript library for building user interfaces from small reusable pieces called **components**. You describe *what the UI should look like for the current data*, and React updates the DOM efficiently.

## Components and JSX
A component is a function that returns JSX, an HTML-like syntax inside JavaScript.
```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

export default function App() {
  return (
    <main>
      <Welcome name="Asha" />
      <Welcome name="Ravi" />
    </main>
  );
}
```
Rules of JSX: return a single root element (or a fragment `<>...</>`), use `className` instead of `class`, and wrap JavaScript expressions in `{}`.

## Rendering lists
```jsx
<ul>
  {courses.map(c => <li key={c.id}>{c.title}</li>)}
</ul>
```
Each item needs a stable, unique `key` so React can track it between renders.

## Virtual DOM
React keeps a lightweight copy of the UI, compares the new version to the old one (**reconciliation**) and applies only the differences to the real DOM.

## Tooling
Vite or Next.js scaffolds a project: `npm create vite@latest my-app`.

> **Key takeaway:** UI = function(data). Break the screen into components and let React handle updates.""",

"React State and Props": """# React State and Props

## Props: data passed down
Props are read-only inputs a parent gives a child.
```jsx
function CourseCard({ title, hours }) {
  return <p>{title} ({hours}h)</p>;
}
<CourseCard title="React" hours={12} />
```

## State: data a component owns
State is data that changes over time and triggers a re-render.
```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>;
}
```

## Rules of state
- Never modify state directly (`count++`); always call the setter.
- Updates are asynchronous. When the new value depends on the old one, use the functional form: `setCount(c => c + 1)`.
- Treat objects and arrays as immutable: create copies (`{...user, name}` or `[...items, item]`).

## Lifting state up
When two components need the same data, move the state to their closest common parent and pass it down as props, with callbacks for updates going up.

## Controlled inputs
```jsx
<input value={text} onChange={e => setText(e.target.value)} />
```
The input's value is driven by state, giving you a single source of truth.

> **Key takeaway:** props flow down, events flow up, and state must be updated immutably through its setter.""",

"React Hooks Deep Dive": """# React Hooks Deep Dive

## What are hooks?
Hooks are functions (names start with `use`) that let function components use state and other React features. Call them only at the top level of a component or custom hook, never inside loops or conditions.

## useEffect: side effects
```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);   // cleanup
}, []);                             // dependency array
```
- `[]` runs once after the first render.
- `[a, b]` re-runs when `a` or `b` change.
- No array runs after every render (rarely what you want).
Use effects for data fetching, subscriptions and timers, not for calculations that can be done during rendering.

## useRef
Holds a mutable value that does **not** cause re-renders, and is also used to reach DOM nodes.
```jsx
const inputRef = useRef(null);
<input ref={inputRef} />;  inputRef.current.focus();
```

## useMemo and useCallback
`useMemo` caches an expensive computed value; `useCallback` caches a function identity. Use them for measured performance problems, not by default.

## useReducer
Better than `useState` when state has several related fields or complex transitions.
```jsx
function reducer(state, action) {
  switch (action.type) {
    case "add": return { ...state, items: [...state.items, action.item] };
    default: return state;
  }
}
const [state, dispatch] = useReducer(reducer, { items: [] });
```

## Custom hooks
Extract reusable logic: `function useDebounce(value, delay) { ... }`.

> **Key takeaway:** effects synchronise your component with the outside world; always think about the dependency array and cleanup.""",

"Node.js Fundamentals": """# Node.js Fundamentals

## What Node.js is
Node.js runs JavaScript outside the browser using Google's V8 engine. It is built around a **non-blocking, event-driven** model, which makes it efficient for I/O-heavy servers.

## Modules
```javascript
// math.js
export const add = (a, b) => a + b;

// app.js
import { add } from "./math.js";
console.log(add(2, 3));
```
Node supports ES modules (`import/export`, with `"type": "module"` in `package.json`) and the older CommonJS (`require`).

## npm and package.json
`package.json` records your project's metadata, scripts and dependencies. `npm install express` adds a dependency; `npm run dev` runs a script. `node_modules` should never be committed to Git.

## Built-in modules
`fs` (files), `path`, `http`, `os`, `crypto`.
```javascript
import { readFile } from "node:fs/promises";
const text = await readFile("notes.txt", "utf8");
```

## A tiny HTTP server
```javascript
import http from "node:http";
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node");
}).listen(3000);
```

## Environment variables
Keep secrets (API keys, database passwords) in environment variables (`process.env.DB_URL`), not in source code.

> **Key takeaway:** Node lets you use one language on both sides; its strength is handling many concurrent I/O operations without blocking.""",

"Express REST APIs": """# Express REST APIs

## REST in brief
REST models your data as **resources** identified by URLs and manipulated with HTTP methods.

| Request | Meaning |
|---|---|
| GET /api/courses | List courses |
| GET /api/courses/5 | Get one course |
| POST /api/courses | Create a course |
| PUT /api/courses/5 | Replace/update it |
| DELETE /api/courses/5 | Delete it |

## A basic Express app
```javascript
import express from "express";
const app = express();
app.use(express.json());              // parse JSON bodies

app.get("/api/courses/:id", (req, res) => {
  const course = findCourse(req.params.id);
  if (!course) return res.status(404).json({ error: "Not found" });
  res.json(course);
});

app.post("/api/courses", (req, res) => {
  const created = createCourse(req.body);
  res.status(201).json(created);
});

app.listen(3000);
```

## Middleware
Middleware are functions `(req, res, next)` that run in order: logging, authentication, validation. Call `next()` to continue or send a response to stop.

## Good API practice
- Use correct status codes (`201` for creation, `400` for bad input, `401/403` for auth issues).
- Validate all input; never trust the client.
- Use a central error-handling middleware.
- Version your API (`/api/v1/...`) and use consistent JSON shapes.

> **Key takeaway:** an API is a contract. Resources, verbs and status codes make it predictable for every client.""",

"Database Integration": """# Database Integration

## Choosing a database
- **Relational (SQL)**: PostgreSQL, MySQL, SQLite. Data lives in tables with a fixed schema and relationships; strong consistency and powerful queries.
- **Document (NoSQL)**: MongoDB. Flexible JSON-like documents; convenient when the shape of data varies.

## SQL essentials
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

SELECT c.title, COUNT(e.id) AS learners
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.title;
```
A **primary key** identifies a row; a **foreign key** links to another table.

## Preventing SQL injection
Never build queries by concatenating user input. Use **parameterised queries**:
```javascript
const { rows } = await pool.query(
  "SELECT * FROM users WHERE email = $1", [email]
);
```

## ORMs
Tools such as Prisma, Sequelize or SQLAlchemy map tables to objects, generate queries and manage migrations. They improve productivity but you still need to understand the SQL they produce.

## Other essentials
- **Indexes** speed up lookups on frequently filtered columns.
- **Transactions** make a group of operations succeed or fail together.
- **Migrations** version-control your schema.
- Hash passwords (bcrypt/argon2); never store them in plain text.

> **Key takeaway:** model your data carefully, always parameterise queries, and index what you search on.""",

"Version Control with Git": """# Version Control with Git

## Why version control?
Git records the history of your project so you can review changes, undo mistakes and collaborate without overwriting each other's work.

## Core workflow
```bash
git init                      # start a repository
git status                    # what changed?
git add file.js               # stage changes
git commit -m "Add login form" # save a snapshot
git log --oneline             # view history
```
Three areas: **working directory**, **staging area**, **repository**.

## Branching
Branches let you develop features in isolation.
```bash
git switch -c feature/login   # create and switch
git switch main
git merge feature/login
```

## Working with remotes
```bash
git clone <url>
git pull            # fetch + merge remote changes
git push origin feature/login
```
A **pull request** asks teammates to review a branch before it is merged.

## Merge conflicts
Conflicts occur when two branches change the same lines. Git marks them with `<<<<<<<`, `=======` and `>>>>>>>`; you choose the final text, then `git add` and commit.

## Good habits
- Commit small, focused changes with clear messages.
- Never commit secrets or `node_modules`; list them in `.gitignore`.
- Pull before you push.

> **Key takeaway:** commit early, branch for every feature, and review through pull requests.""",

"CI/CD Pipelines": """# CI/CD Pipelines

## Definitions
- **Continuous Integration (CI)**: every push is automatically built and tested, so integration problems are found within minutes.
- **Continuous Delivery**: every passing build is ready to release with a click.
- **Continuous Deployment**: every passing build is released to production automatically.

## Anatomy of a pipeline
1. **Trigger**: a push or pull request.
2. **Install**: restore dependencies (with caching).
3. **Lint and type-check**.
4. **Test**: unit, then integration tests.
5. **Build**: create the deployable artifact.
6. **Deploy**: to staging, then production.

## Example: GitHub Actions
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## Best practices
- Keep pipelines fast; slow feedback gets ignored.
- Store secrets in the CI provider's secret store, never in the repository.
- Use environments (staging, production) and require approval for production.
- Make rollbacks easy.

> **Key takeaway:** automate the boring, error-prone steps so every change is tested the same way, every time.""",

"Cloud Deployment": """# Cloud Deployment

## Where apps run
- **IaaS** (AWS EC2, Azure VMs): you manage the operating system and runtime.
- **PaaS** (Render, Heroku, Vercel, App Engine): you push code, the platform runs it.
- **Serverless** (AWS Lambda): functions run on demand and scale to zero.
- **Static hosting / CDN** (Netlify, Cloudflare Pages): ideal for built React front ends.

## Containers
Docker packages an app with its dependencies so it runs identically everywhere.
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## Production checklist
1. **Configuration** in environment variables per environment.
2. **HTTPS** everywhere (TLS certificates).
3. **Database** hosted separately, with automated backups.
4. **Logging and monitoring** so failures are visible.
5. **Scaling**: run several instances behind a load balancer.
6. **Security**: least-privilege access, updated dependencies, CORS configured.

## Deployment strategies
- **Rolling**: replace instances gradually.
- **Blue/green**: run old and new versions side by side, then switch traffic.
- **Canary**: send a small percentage of users to the new version first.

> **Key takeaway:** deployment is repeatable when configuration, containers and pipelines are treated as code.""",
}

QUIZZES = {
"Web Fundamentals": [
 ("Which HTTP method is normally used to create a new resource?", "GET", "POST", "DELETE", "HEAD", "b"),
 ("What does a 404 status code mean?", "Server error", "Unauthorized", "Resource not found", "Redirect", "c"),
 ("Which HTML element should hold the primary, unique content of a page?", "<main>", "<aside>", "<footer>", "<div>", "a"),
 ("In the CSS box model, which layer sits directly outside the border?", "Padding", "Content", "Margin", "Outline-box", "c"),
 ("What does `box-sizing: border-box` change?", "Width includes padding and border", "Removes margins", "Makes text bold", "Centres the element", "a"),
],
"JavaScript Essentials": [
 ("Which keyword should you prefer for a variable that is never reassigned?", "var", "let", "const", "static", "c"),
 ("What does `[1,2,3].map(n => n * 2)` return?", "[1,2,3]", "[2,4,6]", "6", "undefined", "b"),
 ("Why should you prefer `textContent` over `innerHTML` for user-provided text?", "It is slower", "It avoids XSS risks", "It supports HTML tags", "It is deprecated", "b"),
 ("Which statement about `fetch` is true?", "It rejects on any 404 response", "It never returns a Promise", "You must check `res.ok` for HTTP errors", "It only works with GET", "c"),
 ("What does `Promise.all` do?", "Runs promises one after another", "Waits for all promises and rejects if one rejects", "Cancels all promises", "Returns the fastest promise only", "b"),
],
"React Development": [
 ("What is the purpose of the `key` prop in a list?", "Styling list items", "Helping React identify items between renders", "Encrypting data", "Sorting the list", "b"),
 ("How should you update state that depends on its previous value?", "count++", "setCount(c => c + 1)", "count = count + 1", "state.count += 1", "b"),
 ("What does an empty dependency array `[]` in useEffect mean?", "Runs after every render", "Never runs", "Runs once after the first render", "Runs before rendering", "c"),
 ("Which hook stores a value that does NOT trigger a re-render when changed?", "useState", "useRef", "useReducer", "useContext", "b"),
 ("Data in React normally flows...", "Up from child to parent via props", "Down from parent to child via props", "Sideways between siblings automatically", "Only through global variables", "b"),
],
"Backend with Node.js": [
 ("Node.js is best described as...", "A browser", "A JavaScript runtime built on V8", "A CSS framework", "A database", "b"),
 ("Which status code should a successful resource creation return?", "200", "201", "301", "204", "b"),
 ("In Express, what does `next()` do inside middleware?", "Ends the server", "Passes control to the next middleware", "Restarts the app", "Sends a 404", "b"),
 ("What is the safest way to include user input in a SQL query?", "String concatenation", "Parameterised queries", "Escaping quotes by hand", "Storing it in a cookie", "b"),
 ("Where should database passwords and API keys be stored?", "In the source code", "In a public README", "In environment variables", "In the HTML", "c"),
],
"Deployment & DevOps": [
 ("What does `git pull` do?", "Deletes a branch", "Fetches and merges remote changes", "Creates a commit", "Stages files", "b"),
 ("Continuous Integration primarily aims to...", "Replace developers", "Detect integration problems early through automated builds and tests", "Design the UI", "Store passwords", "b"),
 ("Which deployment strategy sends a small share of users to the new version first?", "Canary", "Big bang", "Cold start", "Rollback", "a"),
 ("Why use Docker?", "To write CSS faster", "To package an app with its dependencies so it runs consistently", "To replace Git", "To encrypt databases", "b"),
 ("What should be listed in `.gitignore`?", "Source files", "node_modules and secret files", "README.md", "package.json", "b"),
],
}
