# DataTable Component

Generic, headless-ish Angular standalone component for rendering tabular data with sorting, pagination, custom cell templates, and Tailwind + DaisyUI styling conventions.

## Goals

- Reusable across entities (Customers, Projects, etc.)
- External state control (parent owns data, total count, paging + sort inputs)
- Simple API via Inputs/Outputs (no service coupling)
- Customizable cell rendering through `<ng-template dataTableCell="field">`
- Accessible & responsive (hide secondary columns on small screens)

## Key Features

- Column definition via `columns: DataTableColumn[]`
- Sort indicators & toggle per column
- Pagination (page size selector + numbered pages + prev/next)
- Slot templates for custom cells (status badges, actions, composite values)
- Responsive column hiding using Tailwind `hidden md:table-cell` pattern

## Usage Example (Customers)

```html
<app-data-table
  [items]="result().items"
  [total]="result().total"
  [page]="page()"
  [pageSize]="pageSize()"
  [sortField]="sortField()"
  [sortDir]="sortDir()"
  [columns]="columns"
  (sortChange)="onSortChange($event)"
  (pageChange)="setPage($event)"
  (pageSizeChange)="changePageSize($event)">

  <!-- Custom project count cell -->
  <ng-template dataTableCell="projects" let-value let-row="row">
    <span class="badge badge-ghost" *ngIf="row.projects?.length as p">{{ p }}</span>
  </ng-template>

  <!-- Status badge cell -->
  <ng-template dataTableCell="status" let-value>
    <div class="badge" [ngClass]="{
      'badge-success': value === 'Active',
      'badge-neutral': value === 'Lead',
      'badge-error': value === 'Churned'
    }">{{ value }}</div>
  </ng-template>

  <!-- Row actions -->
  <ng-template dataTableCell="actions" let-row>
    <button class="btn btn-xs btn-outline">Öppna</button>
  </ng-template>
</app-data-table>
```

```ts
// customers.component.ts (excerpt)
columns: DataTableColumn[] = [
  { field: 'name', label: 'Namn', sortable: true },
  { field: 'contactName', label: 'Kontakt', sortable: true, hide: 'md' },
  { field: 'projects', label: 'Projekt', sortable: false, hide: 'sm' },
  { field: 'status', label: 'Status', sortable: true, hide: 'sm' },
  { field: 'actions', label: '', sortable: false, headerClasses: 'w-1' }
];

onSortChange(f: string) {
  if (this.sortField() === f) {
    this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
  } else {
    this.sortField.set(f);
    this.sortDir.set('asc');
  }
  this.page.set(1);
}
```

## API

### Inputs

- `items: any[]` Data for current page.
- `total: number` Total item count across all pages.
- `page: number` 1-based current page.
- `pageSize: number` Items per page.
- `sortField?: string` Active sort field.
- `sortDir?: 'asc' | 'desc'` Active sort direction.
- `columns: DataTableColumn[]` Column metadata.

### Outputs

- `sortChange: string` Emitted when user clicks a sortable header (field name).
- `pageChange: number` Emitted when user changes page.
- `pageSizeChange: number` Emitted when user selects new page size.

### Interfaces

```ts
export interface DataTableColumn {
  field: string;               // Property name / template key
  label: string;               // Header text (can be empty for actions)
  sortable?: boolean;          // Enable header click sort toggle
  hide?: 'sm' | 'md' | 'lg';   // Responsive hide breakpoint
  headerClasses?: string;      // Extra classes for <th>
  cellClasses?: string;        // Extra classes for <td>
}
```

## Cell Templates

Provide one `<ng-template>` per field that needs custom rendering:

```html
<ng-template dataTableCell="status" let-value let-row="row"> ... </ng-template>
```

Variables available:

- `value` = `row[field]` for the column.
- `row` = full item object.

If no template is supplied, plain text `{{ row[field] }}` is rendered.

## Sorting Pattern

Parent owns sort state:

1. Listen to `(sortChange)`
2. Toggle / set `sortField` + `sortDir`
3. Reset `page` to 1
4. Re-query data service (if server-side) or recompute slice (if client-side)

## Pagination Pattern

- Component calculates visible page buttons based on `total`, `page`, `pageSize`.
- Emits `pageChange` / `pageSizeChange`; parent updates signals and refreshes data.

## Styling & Theming

- Uses DaisyUI semantic classes only (`table`, `btn`, `badge`, etc.).
- Column hiding uses Tailwind prefixes:
  - `hide: 'sm'` -> `hidden sm:table-cell`
  - `hide: 'md'` -> `hidden md:table-cell`
  - `hide: 'lg'` -> `hidden lg:table-cell`
- No inline colors; inherits current theme.

## Accessibility Notes

- Sortable headers are buttons with `aria-sort` updated.
- Pagination controls use buttons with disabled states.
- Keep action column headers empty but with accessible labels on buttons inside (e.g. `aria-label="Öppna kund").

## Extensibility Ideas (Future)

- Server-side mode flag (emit combined query object)
- Selectable rows (`(selectionChange)`)
- Column reorder / visibility menu
- Sticky header + scroll container
- Async loading skeleton row state

## Testing Suggestions

- Render with 3 columns + custom template and assert text & badge classes.
- Simulate sort header click -> expect `sortChange` emit.
- Simulate page size change -> expect recalculated page count.

## Maintenance

- Keep logic lean; push complex formatting into templates.
- Avoid introducing state libs; rely on parent signals.
- Update this doc when adding new Inputs/Outputs or behavioral changes.
