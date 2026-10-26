You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Build every screen mobile-first: unprefixed Tailwind classes define the small-screen layout, and `sm:`, `md:`, and `lg:` variants progressively enhance it.
- Check layouts at narrow phone widths (320px and 375px), tablet, and desktop sizes; prevent horizontal overflow and keep text and controls usable when content wraps.
- Make interactive targets touch-friendly on mobile (aim for at least 44px), and stack controls vertically when a horizontal layout is cramped.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Project Requirements and Development Workflow

- Treat the README as the source of truth for the project's documented features, behaviors, and contribution workflow.
- Before changing or extending a feature, read its requirements in the README and preserve every established behavior unless the user explicitly requests a change.
- Document every new user-facing feature or functionality in the README in the same change. Keep its feature requirements current when behavior is intentionally changed or removed.
- Add or update tests for new functionality and existing behaviors affected by a change. Keep the README's documented behavior and the tests consistent.
- Follow the contribution workflow in the README: create feature branches from `develop`, use focused changes and clear Conventional Commit messages, run `npm test -- --watch=false` and `npm run build` before opening a pull request, and target feature pull requests at `develop`. Promote approved releases from `develop` to `main`.
