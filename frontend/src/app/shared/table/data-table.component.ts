import { CommonModule } from '@angular/common';
import { Component, ContentChild, ContentChildren, EventEmitter, Input, Output, QueryList, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTableCellTemplateDirective } from './data-table-cell.directive';

/**
 * Definition of a table column for the generic DataTableComponent.
 * field        : property name to read from each row object (or key used for template lookup)
 * header       : column header text (Swedish UI text ok – logic stays English)
 * sortable     : enables click sorting (component will emit (sort) with field)
 * headerClass  : extra classes on <th>
 * cellClass    : static class string OR function(row) returning classes
 * hide         : responsive Tailwind utility string (e.g. 'hidden md:table-cell')
 * align        : text alignment helper; adds text-center / text-right
 */
export interface DataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  headerClass?: string;
  cellClass?: string | ((row: any) => string);
  hide?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent {
  /** Column configuration */
  @Input() columns: DataTableColumn[] = [];
  /** Current page of row objects */
  @Input() items: any[] = [];
  /** Total number of rows across all pages */
  @Input() total = 0;
  /** 1-based current page */
  @Input() page = 1;
  /** Rows per page */
  @Input() pageSize = 10;
  /** Total page count (pre-calculated by caller for flexibility e.g. server-side) */
  @Input() totalPages = 1;
  /** Active sort field */
  @Input() sortField = '';
  /** Active sort direction */
  @Input() sortDir: 'asc' | 'desc' = 'asc';
  /** When true, table is visually dimmed (e.g. while fetching) */
  @Input() loading = false;
  /** Available page-size dropdown choices */
  @Input() pageSizeOptions: number[] = [10, 25, 50];
  /** Show or hide footer (pagination / range) */
  @Input() showFooter = true;
  /** Compact row height */
  @Input() dense = false;

  /** Emitted when user clicks sortable header (payload = field) */
  @Output() sort = new EventEmitter<string>();
  /** Emitted when a new page is requested */
  @Output() pageChange = new EventEmitter<number>();
  /** Emitted when page size changes */
  @Output() pageSizeChange = new EventEmitter<number>();
  /** Emitted on row click (entire row) */
  @Output() rowClick = new EventEmitter<any>();

  @ContentChildren(DataTableCellTemplateDirective) cellTemplates?: QueryList<DataTableCellTemplateDirective>;
  @ContentChild('rowActions') rowActionsTpl: any;

  private tmplMap = signal<Record<string, any>>({});
  templateFor = computed(() => this.tmplMap());

  ngAfterContentInit() {
    this.rebuildTemplateMap();
    this.cellTemplates?.changes.subscribe(() => this.rebuildTemplateMap());
  }

  private rebuildTemplateMap() {
    const map: Record<string, any> = {};
    this.cellTemplates?.forEach(t => { if (t.field) map[t.field] = t.template; });
    this.tmplMap.set(map);
  }

  /** Returns arrow indicator for current sort column */
  indicator(field: string) {
    if (this.sortField !== field) return '';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }
  /** Emits sort event when a sortable header is clicked */
  onSort(col: DataTableColumn) { if (col.sortable) this.sort.emit(col.field); }
  changePage(p: number) { this.pageChange.emit(p); }
  changePageSize(v: string | number) { const n = Number(v); if (!isNaN(n)) this.pageSizeChange.emit(n); }
  pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  /** Resolve header classes combining optional headerClass + hide utilities */
  headerClasses(col: DataTableColumn) { return [col.headerClass, col.hide].filter(Boolean).join(' '); }
  /** Compute td classes for a row/column combination */
  rowClasses(col: DataTableColumn, row: any) {
    const base: string[] = [];
    if (col.align === 'center') base.push('text-center');
    if (col.align === 'right') base.push('text-right');
    if (typeof col.cellClass === 'function') base.push(col.cellClass(row)); else if (col.cellClass) base.push(col.cellClass);
    if (col.hide) base.push(col.hide);
    return base.join(' ');
  }
  get from() { return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1; }
  get to() { return Math.min(this.total, this.page * this.pageSize); }
}
