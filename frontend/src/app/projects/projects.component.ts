import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Component, signal, computed, effect } from '@angular/core';
import { ProjectMockService, Project } from './project-mock.service';
import { DataTableComponent, DataTableColumn } from '../shared/table/data-table.component';
import { DataTableCellTemplateDirective } from '../shared/table/data-table-cell.directive';
import { SekCurrencyPipe } from '../shared/pipes/sek-currency.pipe';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DataTableComponent, DataTableCellTemplateDirective, SekCurrencyPipe],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent {
  constructor(private projectService: ProjectMockService) {
    effect(() => { this.page(); this.sortField(); this.sortDir(); });
    effect(() => { this.search(); this.statusFilter(); this.pageSize(); this.page.set(1); });
  }

  search = signal('');
  statusFilter = signal<'Alla' | 'Draft' | 'Quoted' | 'Approved' | 'Completed'>('Alla');
  sortField = signal<keyof Project>('created');
  sortDir = signal<'asc'|'desc'>('desc');
  page = signal(1);
  pageSize = signal(10);

  result = computed(() => {
    const status = this.statusFilter() === 'Alla' ? '' : this.statusFilter();
    return this.projectService.query({
      search: this.search(),
      status: status as '' | 'Draft' | 'Quoted' | 'Approved' | 'Completed',
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

  toggleSort(field: keyof Project | string) {
    const f = field as keyof Project;
    if (this.sortField() === f) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(f);
      this.sortDir.set('asc');
    }
  }

  get searchValue() { return this.search(); }
  set searchValue(v: string) { this.search.set(v); }

  columns: DataTableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, cellClass: 'font-mono tabular-nums' },
    { field: 'name', header: 'Namn', sortable: true, cellClass: 'font-medium' },
    { field: 'customerName', header: 'Kund', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'quoteTotalAmount', header: 'Offert (SEK)', sortable: true, align: 'right', cellClass: 'font-mono tabular-nums' },
    { field: 'customerRequestedDeliveryDate', header: 'Önskat (Kund)', sortable: true, cellClass: 'font-mono tabular-nums text-xs', hide: 'hidden xl:table-cell' },
    { field: 'calculatedDeliveryDate', header: 'Ber. Leverans', sortable: true, cellClass: 'font-mono tabular-nums text-xs', hide: 'hidden md:table-cell' },
    { field: 'created', header: 'Skapad', sortable: true, cellClass: 'font-mono tabular-nums text-xs', hide: 'hidden lg:table-cell' }
  ];
}
