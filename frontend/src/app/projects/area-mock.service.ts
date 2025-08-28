import { Injectable, signal } from '@angular/core';

export type AreaPositionStatus = 'Draft' | 'Measured' | 'Configured';

export interface AreaPosition {
  id: number;
  areaId: number;
  name: string;
  width?: number; // cm
  height?: number; // cm
  productType?: string; // ex "Gardin"
  fasteningType?: string; // fästtyp
  fabric?: string; // vald tyg (displaynamn)
  fabricItemId?: number; // koppling till Item
  status: AreaPositionStatus;
  updated: string; // YYYY-MM-DD
}

export interface Area {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  positions: AreaPosition[];
  created: string;
}

@Injectable({ providedIn: 'root' })
export class AreaMockService {
  private readonly areas = signal<Area[]>(this.generate());

  list(projectId: number) { return this.areas().filter(a => a.projectId === projectId); }
  getArea(areaId: number) { return this.areas().find(a => a.id === areaId) || null; }
  getPosition(areaId: number, positionId: number) { return this.getArea(areaId)?.positions.find(p => p.id === positionId) || null; }

  addArea(projectId: number, name: string) {
    const today = new Date().toISOString().slice(0,10);
    const newArea: Area = { id: this.nextAreaId(), projectId, name, positions: [], created: today };
    this.areas.set([...this.areas(), newArea]);
    return newArea;
  }

  addPosition(areaId: number, name: string) {
    const area = this.getArea(areaId);
    if (!area) return null;
    const today = new Date().toISOString().slice(0,10);
    const pos: AreaPosition = { id: this.nextPositionId(), areaId, name, status: 'Draft', updated: today };
    area.positions.push(pos);
    this.areas.set([...this.areas()]);
    return pos;
  }

  updatePosition(areaId: number, position: AreaPosition) {
    const area = this.getArea(areaId);
    if (!area) return;
    const idx = area.positions.findIndex(p => p.id === position.id);
    if (idx >= 0) {
      area.positions[idx] = { ...position, updated: new Date().toISOString().slice(0,10) };
      this.areas.set([...this.areas()]);
    }
  }

  // --- internal ---
  private nextAreaId() { return Math.max(0, ...this.areas().map(a => a.id)) + 1; }
  private nextPositionId() {
    return Math.max(0, ...this.areas().flatMap(a => a.positions.map(p => p.id))) + 1;
  }
  private generate(): Area[] {
    const names = ['Vardagsrum','Sovrum','Kök','Kontor','Konferensrum'];
    const out: Area[] = [];
    let areaId = 1;
    let posId = 1;
    const today = new Date();
    for (let projectId = 5001; projectId <= 5010; projectId++) {
      const count = Math.floor(Math.random()*3)+1;
      for (let i=0;i<count;i++) {
        const created = new Date(today.getTime() - Math.floor(Math.random()*20)*86400000).toISOString().slice(0,10);
        const positions = Array.from({length: Math.floor(Math.random()*2)+1}).map((_,j) => ({
          id: posId++,
          areaId: areaId,
          name: `Pos ${j+1}`,
          status: 'Draft' as AreaPositionStatus,
          updated: created
        }));
        out.push({ id: areaId++, projectId, name: names[Math.floor(Math.random()*names.length)], positions, created });
      }
    }
    return out;
  }
}
