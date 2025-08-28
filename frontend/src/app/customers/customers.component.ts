import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Component, signal, computed } from '@angular/core';

interface CustomerMock {
  id: number;
  name: string;
  contact: string;
  phone: string;
  projects: number;
  status: 'Aktiv' | 'Vilande';
  created: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers.component.html'
})
export class CustomersComponent {
  filter = signal('');
  customers = signal<CustomerMock[]>([
    { id: 101, name: 'Nordic Living AB', contact: 'Anna Svensson', phone: '070-123 45 67', projects: 4, status: 'Aktiv', created: '2025-05-12' },
    { id: 102, name: 'Sol & Sky Entreprenad', contact: 'Björn Karlsson', phone: '070-222 33 11', projects: 2, status: 'Aktiv', created: '2025-06-01' },
    { id: 103, name: 'Interior Studio X', contact: 'Carina Holm', phone: '070-555 88 99', projects: 1, status: 'Vilande', created: '2025-04-27' },
    { id: 104, name: 'Fastighetspartner i Malmö', contact: 'David Persson', phone: '070-444 77 55', projects: 6, status: 'Aktiv', created: '2025-03-19' },
    { id: 105, name: 'Skandinaviska Kontor', contact: 'Eva Lind', phone: '070-987 65 43', projects: 3, status: 'Aktiv', created: '2025-07-08' }
  ]);

  filtered = computed(() => {
    const q = this.filter().toLowerCase();
    if (!q) return this.customers();
    return this.customers().filter(c => c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q));
  });

  clear() { this.filter.set(''); }

  // Getter/setter proxy for ngModel binding
  get filterValue() { return this.filter(); }
  set filterValue(v: string) { this.filter.set(v); }
}
