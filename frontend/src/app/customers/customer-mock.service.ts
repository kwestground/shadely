import { Injectable, signal } from '@angular/core';

export interface Customer {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  projects: number;
  status: 'Aktiv' | 'Vilande';
  created: string; // ISO date string (YYYY-MM-DD)
}

export interface CustomerQuery {
  search?: string;
  status?: '' | 'Aktiv' | 'Vilande';
  sortField?: keyof Customer;
  sortDir?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface CustomerQueryResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerMockService {
  // Internal dataset as a signal to allow future dynamic mutations
  private readonly all = signal<Customer[]>(this.generateCustomers());

  listAll() { return this.all(); }

  query(q: CustomerQuery): CustomerQueryResult {
    const search = (q.search ?? '').trim().toLowerCase();
    const status = q.status ?? '';
    const sortField = q.sortField ?? 'name';
    const sortDir = q.sortDir ?? 'asc';
    let data = this.all();

    if (search) {
      data = data.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.contact.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }
    if (status) {
      data = data.filter(c => c.status === status);
    }

    // Sort
    data = [...data].sort((a, b) => this.compare(a, b, sortField, sortDir));

    const total = data.length;
    const pageSize = Math.max(1, q.pageSize);
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, q.page), maxPage);
    const start = (page - 1) * pageSize;
    const items = data.slice(start, start + pageSize);
    return { items, total, page, pageSize };
  }

  // --- Helpers ---
  private compare(a: Customer, b: Customer, field: keyof Customer, dir: 'asc'|'desc'): number {
    const av = a[field];
    const bv = b[field];
    let res = 0;
    if (typeof av === 'number' && typeof bv === 'number') res = av - bv;
    else res = String(av).localeCompare(String(bv), 'sv');
    return dir === 'asc' ? res : -res;
  }

  private generateCustomers(): Customer[] {
    const names = [
      'Nordic Living AB','Sol & Sky Entreprenad','Interior Studio X','Fastighetspartner i Malmö','Skandinaviska Kontor',
      'Design & Draperi','Solgardiner Pro','Fönster & Rymd','Malmö Inredning','Gardinbolaget Syd',
      'Urban Shade','Ljus & Rullgardin','Nordic Office Solutions','Creative Interiors','Scandic Workspace',
      'EcoSun Solutions','Persienn & Miljö','Premium Draperier','FensterStyle AB','SkuggTeknik','Ljusmiljö Norden',
      'WindowCraft','ShadeWorks','InteriorLab','Form & Funktion','Kontorsmiljö Syd','Space Optimizers',
      'Arc Design','Studio Sol','Miljö Interiör','ViewTech','Shade Factory','InredningsPartner','Nordisk Draperi',
      'Solskydd Direkt','PersiennHuset','Lux Living','Skyline Offices','Creative Drapes','Vision Interiors'
    ];
    const contactsFirst = ['Anna','Björn','Carina','David','Eva','Filip','Gustav','Helena','Ida','Johan','Karin','Lars','Maria','Niklas','Oskar','Petra','Qendresa','Rikard','Sara','Tobias','Ulla','Victor','Wilma','Xavier','Ylva','Zara'];
    const contactsLast = ['Svensson','Karlsson','Holm','Persson','Lind','Andersson','Larsson','Magnusson','Ek','Lund','Nyberg','Axelsson','Berg','Dahl','Fransson','Gunnarsson','Håkansson'];
    const emails = ['@example.se','@kund.se','@company.se','@mail.se'];
    const out: Customer[] = [];
    let id = 100;
    const today = new Date();
    for (const name of names) {
      const contact = `${this.pick(contactsFirst)} ${this.pick(contactsLast)}`;
      const created = new Date(today.getTime() - Math.floor(Math.random() * 90) * 86400000); // within ~90 days
      out.push({
        id: ++id,
        name,
        contact,
        phone: this.fakePhone(),
        email: contact.toLowerCase().replace(/[^a-z]/g,'') + this.pick(emails),
        projects: Math.floor(Math.random()*8),
        status: Math.random() < 0.72 ? 'Aktiv':'Vilande',
        created: created.toISOString().slice(0,10)
      });
    }
    return out;
  }

  private pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
  private fakePhone(): string {
    // Swedish style mobile: 070-xxx xx xx
    const part = () => Math.floor(100 + Math.random()*900).toString();
    const last = () => Math.floor(10 + Math.random()*90).toString();
    return `070-${part().slice(0,3)} ${last()} ${last()}`;
  }
}
