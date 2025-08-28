import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectMockService, Project } from './project-mock.service';
import { AreaMockService, Area } from './area-mock.service';
import { ItemPickerComponent } from '../shared/items/item-picker.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ItemPickerComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent {
  project = signal<Project | null>(null);
  areas = signal<Area[]>([]);
  addingArea = signal(false);
  newAreaName = signal('');
  editingAreaId = signal<number|null>(null);
  // Inline layout (no tabs)
  addingPosAreaId = signal<number|null>(null);
  newPosData = signal<{areaId:number; name:string; width?: number; height?: number; fasteningType: string; fabric: string; fabricItemId?: number} | null>(null);
  editingPos = signal<{areaId:number; positionId:number} | null>(null);
  editData = signal<{name:string; width?: number; height?: number; fasteningType?: string; fabric?: string; fabricItemId?: number} | null>(null);

  constructor(route: ActivatedRoute, private router: Router, private projects: ProjectMockService, private areasSvc: AreaMockService) {
    const id = Number(route.snapshot.paramMap.get('id'));
    const proj = this.projects.getById(id);
    if (!proj) {
      this.router.navigate(['/projekt']);
      return;
    }
    this.project.set(proj);
  this.refreshAreas();
  this.ensureDefaultAreaAndPosition();
  }

  refreshAreas() {
    const p = this.project();
    if (!p) return;
    this.areas.set(this.areasSvc.list(p.id));
  }

  private ensureDefaultAreaAndPosition() {
    const p = this.project();
    if (!p) return;
    const existing = this.areasSvc.list(p.id);
    if (existing.length === 0) {
      const area = this.areasSvc.addArea(p.id, 'Område 1');
      if (area) {
        this.areasSvc.addPosition(area.id, 'Pos 1');
        this.refreshAreas();
      }
    }
  }

  startAddArea() {
    if (!this.project()) return;
    const idx = this.areas().length + 1;
    const area = this.areasSvc.addArea(this.project()!.id, `Område ${idx}`);
    this.refreshAreas();
    if (area) {
      this.editingAreaId.set(area.id);
      this.newAreaName.set(area.name);
      setTimeout(()=>{
        const el = document.getElementById(`edit-area-name-${area.id}`) as HTMLInputElement | null;
        el?.focus(); el?.select();
      },0);
    }
  }
  saveAreaName(areaId: number) {
    const name = this.newAreaName().trim();
    if (name) this.areasSvc.updateAreaName(areaId, name);
    this.editingAreaId.set(null);
    this.newAreaName.set('');
    this.refreshAreas();
    // Efter sparat områdesnamn: om inga positioner, starta direkt ny position och fokusera Namn
    const area = this.areasSvc.getArea(areaId);
    if (area && area.positions.length === 0) {
      this.startAddPosition(area);
      setTimeout(() => {
        const cur = this.newPosData();
        if (cur) {
          this.newPosData.set({ ...cur, name: '' });
          const el = document.getElementById(`new-pos-name-${area.id}`) as HTMLInputElement | null;
          el?.focus();
        }
      }, 0);
    }
  }
  onAreaNameKey(ev: KeyboardEvent, areaId: number) {
    if (ev.key==='Enter') { ev.preventDefault(); this.saveAreaName(areaId); }
    else if (ev.key==='Escape') { this.editingAreaId.set(null); this.newAreaName.set(''); }
  }
  startRenameArea(areaId: number) {
    const area = this.areasSvc.getArea(areaId); if (!area) return;
    this.editingAreaId.set(areaId);
    this.newAreaName.set(area.name);
    setTimeout(()=>{
      const el = document.getElementById(`edit-area-name-${areaId}`) as HTMLInputElement | null;
      el?.focus(); el?.select();
    },0);
  }
  cancelRenameArea() { this.editingAreaId.set(null); this.newAreaName.set(''); }

  cancelAddPosition() {
    this.addingPosAreaId.set(null);
    this.newPosData.set(null);
  }
  saveNewPosition(area: Area) {
    const data = this.newPosData();
    if (!data || !data.name.trim()) return;
    const pos = this.areasSvc.addPosition(area.id, data.name.trim());
    if (pos) {
      const updated = { ...pos, width: data.width, height: data.height, fasteningType: data.fasteningType, fabric: data.fabric || undefined, fabricItemId: data.fabricItemId } as any;
      this.areasSvc.updatePosition(area.id, updated);
    }
    // Refresh and keep add-mode for continuous entry
    this.refreshAreas();
    const latestArea = this.areasSvc.getArea(area.id);
    if (!latestArea) { this.cancelAddPosition(); return; }
    const nextIndex = latestArea.positions.length + 1;
    // Behåll tidigare fästtyp som bekvämlighet
    const nextFastening = data.fasteningType;
    this.newPosData.set({ areaId: area.id, name: `Pos ${nextIndex}`, fasteningType: nextFastening, fabric: '' });
    // Töm ev. mått – användare matar nya
    setTimeout(()=>{
      const el = document.getElementById(`new-pos-name-${area.id}`) as HTMLInputElement | null;
      if (el) { el.focus(); el.select(); }
    },0);
  }
  setNewPosField<K extends keyof NonNullable<ReturnType<typeof this.newPosData>>>(field: K, value: any) {
    const cur = this.newPosData();
    if (!cur) return;
    this.newPosData.set({ ...cur, [field]: value });
  }
  onNewPosKey(ev: KeyboardEvent, area: Area) {
    if (ev.key === 'Enter') { ev.preventDefault(); this.saveNewPosition(area); }
    else if (ev.key === 'Escape') { this.cancelAddPosition(); }
  }

  totalPositions = computed(() => this.areas().reduce((sum,a)=>sum+a.positions.length,0));
  configuredPositions = computed(() => this.areas().reduce((sum,a)=> sum + a.positions.filter(p=>p.status==='Configured').length, 0));

  // Autofokus på första inmatningsfält för ny position
  startAddPosition(area: Area) {
    this.addingPosAreaId.set(area.id);
    const defaultName = `Pos ${area.positions.length + 1}`;
  this.newPosData.set({ areaId: area.id, name: defaultName, fasteningType: 'Wave', fabric: '' });
    setTimeout(() => {
      const el = document.getElementById(`new-pos-name-${area.id}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  // Inline edit av befintlig position
  startEditPosition(areaId: number, posId: number) {
    const area = this.areasSvc.getArea(areaId);
    const pos = area?.positions.find(p=>p.id===posId);
    if (!area || !pos) return;
    this.editingPos.set({ areaId, positionId: posId });
    this.editData.set({
      name: pos.name,
      width: pos.width,
      height: pos.height,
      fasteningType: pos.fasteningType,
      fabric: pos.fabric || '',
      fabricItemId: (pos as any).fabricItemId
    });
    setTimeout(()=>{
      const el = document.getElementById(`edit-pos-name-${areaId}-${posId}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    },0);
  }
  cancelEditPosition() { this.editingPos.set(null); this.editData.set(null); }
  setEditField(field: keyof NonNullable<ReturnType<typeof this.editData>>, value: any) {
    const cur = this.editData(); if (!cur) return; this.editData.set({...cur,[field]:value});
  }
  saveEditPosition() {
    const ep = this.editingPos(); const data = this.editData();
    if (!ep || !data) return;
    const area = this.areasSvc.getArea(ep.areaId); if (!area) return;
    const pos = area.positions.find(p=>p.id===ep.positionId); if (!pos) return;
  const updated = { ...pos, name: data.name.trim() || pos.name, width: data.width, height: data.height, fasteningType: data.fasteningType, fabric: data.fabric || undefined, fabricItemId: data.fabricItemId, status: pos.status === 'Draft' ? 'Configured' : pos.status } as any;
    this.areasSvc.updatePosition(ep.areaId, updated);
    this.cancelEditPosition();
    this.refreshAreas();
  }
  onEditKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter') { ev.preventDefault(); this.saveEditPosition(); }
    else if (ev.key === 'Escape') { this.cancelEditPosition(); }
  }
}
