import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Component, signal, computed, effect } from '@angular/core';
import { CustomerMockService, Customer } from './customer-mock.service';
import { DataTableComponent, DataTableColumn } from '../shared/table/data-table.component';
import { DataTableCellTemplateDirective } from '../shared/table/data-table-cell.directive';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataTableComponent, DataTableCellTemplateDirective],
  templateUrl: './customers.component.html'
})
export class CustomersComponent {
  constructor(private customerService: CustomerMockService) {
    // Reset page when search/status/pageSize changes
    effect(() => { this.page(); this.sortField(); this.sortDir(); }); // keep referenced so they are tracked (no-op)
    effect(() => { this.search(); this.statusFilter(); this.pageSize(); this.page.set(1); });
  }

  // State signals
  search = signal('');
  statusFilter = signal<'Alla' | 'Aktiv' | 'Vilande'>('Alla');
  sortField = signal<keyof Customer>('name');
  sortDir = signal<'asc'|'desc'>('asc');
  page = signal(1);
  pageSize = signal(10);

  // Derived query result
  result = computed(() => {
    const status = this.statusFilter() === 'Alla' ? '' : this.statusFilter();
    return this.customerService.query({
      search: this.search(),
      status: status as '' | 'Aktiv' | 'Vilande',
      sortField: this.sortField(),
      sortDir: this.sortDir(),
      page: this.page(),
      pageSize: this.pageSize()
    });
  });

  total = computed(() => this.result().total);
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  from = computed(() => (this.result().total === 0 ? 0 : (this.result().page - 1) * this.result().pageSize + 1));
  to = computed(() => Math.min(this.result().total, this.result().page * this.result().pageSize));

  clearSearch() { this.search.set(''); }
  setPage(p: number) { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }
  changePageSize(size: number) { this.pageSize.set(size); }

  toggleSort(field: keyof Customer | string) {
    const f = field as keyof Customer;
    if (this.sortField() === f) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(f);
      this.sortDir.set('asc');
    }
  }

  // Proxy for ngModel (search box)
  get searchValue() { return this.search(); }
  set searchValue(v: string) { this.search.set(v); }

  columns: DataTableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, cellClass: 'font-mono tabular-nums' },
    { field: 'name', header: 'Namn', sortable: true, cellClass: 'font-medium' },
    { field: 'contact', header: 'Kontakt', sortable: true },
    { field: 'phone', header: 'Telefon', sortable: true, cellClass: 'whitespace-nowrap' },
    { field: 'email', header: 'E‑post', sortable: true, cellClass: 'text-xs', hide: 'hidden lg:table-cell' },
    { field: 'projects', header: 'Projekt', sortable: true, align: 'center' },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'created', header: 'Skapad', sortable: true, cellClass: 'font-mono tabular-nums', hide: 'hidden md:table-cell' }
  ];
}
