# Copilot Instructions for Shadely

Purpose: Enable AI coding agents to be immediately productive in this mono‑repo (currently only the Angular mock UI is present; backend architecture & domain model are defined in `README.md` but not yet implemented).

## Kommunikation (Repo-specifik preferens)
- ALL dialog med projektägaren ska ske på svenska (förklaringar, motiveringar, sammanfattningar). Kod, klass-/enum-namn och tekniska identifierare förblir på engelska enligt övriga riktlinjer.
- Om extern dokumentation citeras på engelska: ge först svensk förklaring, därefter ev. originalcitat.
- Behåll kort och koncis ton; undvik onödigt engelskt fackspråk där det finns etablerad svensk term (ex: "bygga" istället för "build" när sammanhanget är tydligt).

## Big Picture
- Product: Mini ERP for curtains / sun protection covering sales → measurement → configuration → purchasing → production → installation → invoicing.
- Current code = Frontend prototype (`frontend/`) with Tailwind + DaisyUI + Angular v20 standalone components + signals. Backend exists only as documented architecture (future `.NET` solution with layered projects: Api/Core/Infrastructure/Services/Integration).
- Core domain language & flows (Swedish UI strings, English code identifiers) are extensively documented in `README.md`; treat it as the authoritative domain contract until backend code exists.

## Frontend Structure & Conventions
- Angular standalone components (no NgModules). Example: `DashboardComponent` declares `standalone: true` and is routed directly in `app.routes.ts`.
- Routing: Central array in `src/app/app.routes.ts` – keep root dashboard at path ''. Add new feature routes here (lazy modules can be introduced later; for now keep consistency with standalone components).
- Theming: DaisyUI themes `shadelylight` / `shadelydark`; switching managed by `ThemeService` using Angular `signal` + `effect`. Never set theme classes manually on components—use `currentTheme()` and DaisyUI semantic classes.
- State: Prefer Angular signals for local/UI state (see `DashboardComponent` `loading = signal(false)`). Do not introduce NgRx until real async/domain data appears.
- Styling: Use Tailwind utility classes + DaisyUI component classes. Avoid inline style / hardcoded colors; if a new semantic color is required, extend themes in `tailwind.config.cjs` (not present yet in repo excerpt, but DaisyUI config defined there).
- Language: Keep domain model terms EXACTLY as in README enums & entity names to ease future backend alignment (e.g. `ProductionOrderStatus.InProgress`). UI copy stays Swedish.

## When Adding Backend Integration (Future)
- Create a new top-level `backend/` or `src/` .NET solution matching the documented architecture sections; mirror entity & enum names (store enums as string via EF Core `HasConversion<string>()`).
- Introduce typed DTOs first; then retrofit current mock dashboard replacing hardcoded arrays with service calls.
- Inventory & Audit logic: centralize in an `InventoryService` and EF Core interceptors (per README guidelines) – keep frontend unaware of internal transaction details (request aggregated projections like `MaterialShortageView`).

## Developer Workflows
- Install & run UI: `cd frontend && npm install && npm start` (serves with `ng serve --open`). Build: `npm run build`. Lint/Test scripts exist but no test files yet.
- Add a new feature component: place under `src/app/<feature>/<feature>.component.{ts,html}` with `standalone: true`, import `CommonModule` plus any shared components (to be created). Register route in `app.routes.ts`.
- Add theme-dependent UI: rely on DaisyUI classes (`btn-primary`, `bg-base-100`, etc.). Toggle via injected `ThemeService`.

## Patterns to Follow (Concrete Examples)
- Signal usage: replicate `currentTheme = this.theme.currentTheme;` and template binding `currentTheme() === 'shadelydark'` for reactive theme variant selection.
- Layout pattern: Root drawer layout in `app.component.html` (navigation aside + top navbar). For new pages, inject content into `<router-outlet>`; do not duplicate layout.
- Dashboard stat cards follow DaisyUI `stat` pattern inside responsive grid (`grid gap-4 sm:grid-cols-2 xl:grid-cols-4`). Reuse structure for other summary views.

## Domain Model Alignment
- Use enums from README verbatim; anticipate backend serialization as strings (e.g., show status badges like `<div class="badge badge-info">InProgress</div>` already in `dashboard.component.html`).
- Product configurator will branch by `ConfigurationType` ("Matrix" vs "Dynamic"). Prepare frontend abstractions: `IProductType`, `IAttribute`, `ISection` (naming in English) later.
- Inventory: Frontend should request computed shortage projections instead of recalculating formulas—avoid duplicating `QuantityFormula` / `HoursFormula` logic client-side.

## Non-Goals (Avoid Premature Work)
- Do NOT add i18n extraction, state libraries (NgRx), or complex form frameworks yet.
- Do NOT create enum lookup tables client-side; rely on static constants until backend API is live.
- Do NOT implement offline sync logic until measurement/mobile features begin.

## Extending the Repo
- New shared UI: create `src/app/shared/` (components, directives, pipes) once first reuse occurs; keep atomic (no barrel file until there are >3 exports).
- Testing: When introduced, colocate `*.spec.ts` next to component; keep tests light (render + key interaction). Use Angular TestBed with standalone component.
- Performance: Prefer on-push style via standalone defaults + signals; avoid large reactive chains—simple signals suffice.
- Documentation hygiene: When you add a new reusable component / directive / pipe (esp. under `shared/`), append or adjust a concise usage note in this file (or create a short `README.md` in that subfolder) covering: purpose, minimal usage snippet, key inputs/outputs, and any conventions (styling, accessibility, theming). Keep it terse so future agents can re-use without re-reading source.

### Shared Pipe Usage Notes

#### `SekCurrencyPipe` (`sek`)
Purpose: Format belopp i SEK enligt svensk standard (mellanslag som tusentalsavskiljare, "kr" efter belopp). Standalone pipe.
Minimal: `{{ amount | sek }}` → `12 345 kr`
Med decimaler: `{{ amount | sek:{decimals:2} }}` → `12 345,50 kr`
Parametrar: `decimals?: number` (default 0), `showZeroDecimals?: boolean` (tvinga visa `.00` om decimals>0 och värdet är heltal)
Edge: Returnerar tom sträng om indata ej är numeriskt.

## Quality & Consistency Checklist (Apply on PRs)
- Component uses standalone & imports only what it needs.
- Tailwind/DaisyUI classes, no inline style/color literals.
- Domain names match README (case & spelling) for entities/statuses.
- Theme not hardcoded; UI adapts automatically to both themes.
- Mock data isolated (easy to swap for API service later).

## Ask / Clarify
If domain behavior seems ambiguous, first consult `README.md` domain sections; if still unclear, request clarification before inventing new states or fields.

---
Provide feedback if any section is unclear or if backend code is added so this guide can evolve.

## Documentation Index (keep updated)
Central index of living documentation under `docs/`. Whenever you add/rename/remove a doc in `docs/`, update this list in the same commit.

Current docs:
- `docs/DESIGN_GUIDELINES.md` – Frontend UI design & styling guidelines.
- `docs/frontend/data-table.md` – Generic DataTable component usage & API.
 - `docs/backend/migrations.md` – EF Core migrations workflow & conventions.

Rule: PRs introducing new docs MUST append a bullet with path + short (max ~12 words) description here.
