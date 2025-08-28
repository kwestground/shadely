import { Injectable, signal } from '@angular/core';

// NOTE: ProjectStatus enum values not explicitly enumerated in README.
// Using values mentioned in workflow: Quoted, Approved. Added Draft & Completed as reasonable placeholders.
// Assumption documented; adjust when backend enum is finalized.
export type ProjectStatus = 'Draft' | 'Quoted' | 'Approved' | 'Completed';

export interface Project {
  id: number;
  name: string;
  customerName: string;
  status: ProjectStatus;
  quoteTotalAmount: number; // SEK (placeholder)
  customerRequestedDeliveryDate?: string; // YYYY-MM-DD
  calculatedDeliveryDate?: string; // YYYY-MM-DD
  created: string; // YYYY-MM-DD
}

export interface ProjectQuery {
  search?: string;
  status?: '' | ProjectStatus;
  sortField?: keyof Project;
  sortDir?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ProjectQueryResult {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectMockService {
  private readonly all = signal<Project[]>(this.generateProjects());

  listAll() { return this.all(); }

  query(q: ProjectQuery): ProjectQueryResult {
    const search = (q.search ?? '').trim().toLowerCase();
    const status = q.status ?? '';
    const sortField = q.sortField ?? 'created';
    const sortDir = q.sortDir ?? 'desc';
    let data = this.all();

    if (search) {
      data = data.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.customerName.toLowerCase().includes(search)
      );
    }
    if (status) data = data.filter(p => p.status === status);

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
  private compare(a: Project, b: Project, field: keyof Project, dir: 'asc'|'desc'): number {
    const av = a[field];
    const bv = b[field];
    let res = 0;
    if (typeof av === 'number' && typeof bv === 'number') res = av - bv;
    else res = String(av ?? '').localeCompare(String(bv ?? ''), 'sv');
    return dir === 'asc' ? res : -res;
  }

  private generateProjects(): Project[] {
    const projectNames = [
      'Kontorsmodernisering', 'Butiksinstallation', 'Hotellrenovering', 'Showroom Gardiner', 'Skola Solskydd',
      'Restaurang Interiör', 'Fasadpersienner Etapp 1', 'Konferensrum Gardiner', 'Lounge Akustik', 'Villa Solskydd',
      'Laboratorium Mörkläggning', 'Reception Gardinbyte', 'Utställning Textil', 'Atelje Förbättring', 'Café Markiser'
    ];
    const customers = [
      'Nordic Living AB', 'Sol & Sky Entreprenad', 'Interior Studio X', 'Fastighetspartner i Malmö', 'Skandinaviska Kontor',
      'Design & Draperi', 'Malmö Inredning', 'Gardinbolaget Syd', 'Urban Shade', 'Ljus & Rullgardin'
    ];
    const statuses: ProjectStatus[] = ['Draft','Quoted','Approved','Completed'];
    const today = new Date();
    let id = 5000;
    return projectNames.map(name => {
      const created = new Date(today.getTime() - Math.floor(Math.random() * 40) * 86400000);
      const status = statuses[Math.floor(Math.random()*statuses.length)];
      const reqDays = Math.floor(Math.random()*60) + 14; // 2‑10 veckor
      const custReq = new Date(created.getTime() + reqDays*86400000);
      const calcOffset = reqDays + Math.floor(Math.random()*10) - 5; // +/- 5 dagar variation
      const calc = new Date(created.getTime() + calcOffset*86400000);
      const quoteAmount = 15000 + Math.floor(Math.random()*120000); // SEK
      return {
        id: ++id,
        name,
        customerName: customers[Math.floor(Math.random()*customers.length)],
        status,
        quoteTotalAmount: quoteAmount,
        customerRequestedDeliveryDate: custReq.toISOString().slice(0,10),
        calculatedDeliveryDate: calc.toISOString().slice(0,10),
        created: created.toISOString().slice(0,10)
      } as Project;
    });
  }
}
