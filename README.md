# Reaktivate TDD challenge

React + TypeScript + MobX, MVP/MVVM architecture: views focus strictly on rendering, while all business and UX logic lives in isolated controllers.

## Run

```bash
npm install
npm run dev     # Starts local development server (Vite)
npm test        # Runs 25 unit tests via Vitest (single run)
npm run lint    # Runs ESLint code style check
npm run build   # Validates production build
```

**Important (SSL Certificate):** The API uses a self-signed certificate. To allow your browser and application to communicate with the server, open `https://tdd.demo.reaktivate.com/v1/books/<your-id>/` once directly in your browser and select "Proceed/Allow".

The active user identifier can be configured globally in `src/Shared/config.ts`.

## Structure

- `src/Shared/` – API gateway, global configuration, reusable atomic components, and custom `useController` lifecycle hooks.
- `src/Books/` – Domain repository, `PrivateBooksStore` (global state management for app-wide header counters), `BooksController` with `BooksPage` view, and `AddBook/` feature sub-module.
- `src/Header/` – Sticky header layout controlled by its own isolated `HeaderController`.
- `.github/workflows/ci.yml` – Pre-configured GitHub Actions pipeline validating linting, TS compilation, tests, and build status on every push.

**Data Flow:** `View` → `Controller` → `Repository` → `Gateway`. Controllers expose prepared view-model computed getters; functional views only bind them to UI components without any branching or calculations.
