import { Injectable, signal } from '@angular/core';

export interface Item {
  id: number;
  name: string;
  category: string; // ex 'Fabric'
  color?: string; // hex
  unit?: string; // m, m2, st
  price?: number; // SEK
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class ItemMockService {
  private readonly items = signal<Item[]>(this.generate());

  listAll() { return this.items(); }
  byCategory(category: string) { return this.items().filter(i => i.category === category && i.active); }
  search(category: string, term: string) {
    const t = term.trim().toLowerCase();
    return this.byCategory(category).filter(i => !t || i.name.toLowerCase().includes(t));
  }
  get(id: number) { return this.items().find(i => i.id === id) || null; }

  private generate(): Item[] {
    const fabrics = [
      ['Linen White','#f5f2ea'],['Cotton Sand','#e2d3b9'],['Velvet Night','#1d1f2a'],['Sheer Cloud','#fafafa'],['Blackout Grey','#4b4f55'],
      ['Thermal Silver','#b8bcc2'],['Eco Weave Natural','#d7ceb8'],['Silk Pearl','#ede8e2'],['Wool Mist','#e9e5df'],['Bamboo Shade','#b39b62']
    ];
    let id = 9000;
    return [
      ...fabrics.map(f => ({ id: ++id, name: f[0], category: 'Fabric', color: f[1], unit: 'm2', price: 325 + Math.floor(Math.random()*120), active: true })),
      { id: ++id, name: 'Test Inaktiv', category: 'Fabric', active: false }
    ];
  }
}
