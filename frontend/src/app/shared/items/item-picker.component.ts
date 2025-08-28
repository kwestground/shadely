import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed, effect, HostListener, ElementRef, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ItemMockService, Item } from './item-mock.service';

@Component({
  selector: 'app-item-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="relative" (keydown)="onKey($event)">
    <div class="flex items-center gap-1">
      <input #inputEl type="text" class="input input-xs input-bordered w-full focus-ring" [placeholder]="placeholder" [ngModel]="search()" (ngModelChange)="onSearch($event)" (focus)="openPicker()" />
  <button type="button" class="btn btn-ghost btn-2xs transition-opacity" [class.invisible]="!value()" (click)="clear()" tabindex="-1" aria-label="Rensa val">×</button>
    </div>
    <!-- Fixed overlay to avoid clipping inside scrollable parents -->
    <div *ngIf="open()" #scroll class="fixed z-50 max-h-64 overflow-auto overscroll-contain shadow rounded bg-base-100 border border-base-300" (wheel)="$event.stopPropagation()" [style.top.px]="overlayPos().top" [style.left.px]="overlayPos().left" [style.width.px]="overlayPos().width">
      <ul class="menu menu-xs p-1" (wheel)="$event.stopPropagation()">
        <li *ngIf="filtered().length===0" class="px-2 py-1 opacity-60">Inga träffar</li>
        <li *ngFor="let it of filtered(); let i = index" (mouseenter)="activeIndex.set(i)" >
          <a #opt (click)="select(it)" [class.active]="i===activeIndex()" class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full border" *ngIf="it.color" [style.background]="it.color"></span>
            <span class="flex-1 truncate">{{it.name}}</span>
            <span class="text-xs opacity-60" *ngIf="it.price">{{it.price | number:'1.0-0'}} kr</span>
          </a>
        </li>
      </ul>
    </div>
    <div *ngIf="valueItem() && showSelectedBadge" class="mt-1 text-xs flex items-center gap-2">
      <span class="badge badge-outline flex items-center gap-1" [title]="valueItem()!.name">
        <span class="w-2.5 h-2.5 rounded-full border" *ngIf="valueItem()!.color" [style.background]="valueItem()!.color"></span>
        {{valueItem()!.name}}
      </span>
    </div>
  </div>
  `
})
export class ItemPickerComponent {
  @Input() category = 'Fabric';
  @Input() placeholder = 'Sök...';
  @Input() showSelectedBadge = true;
  @Input() set selected(value: number | null | undefined) { this.value.set(value ?? null); this.syncSearchFromValue(); }
  @Output() selectedChange = new EventEmitter<number | null>();
  @Output() itemSelected = new EventEmitter<Item | null>();

  search = signal('');
  open = signal(false);
  value = signal<number | null>(null);
  activeIndex = signal(0);

  @ViewChildren('opt') opts!: QueryList<ElementRef<HTMLAnchorElement>>;
  @ViewChild('scroll') scrollEl?: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;
  overlayPos = signal<{top:number; left:number; width:number}>({top:0,left:0,width:0});

  constructor(private items: ItemMockService, private el: ElementRef) {
    // Auto-scroll aktivt element in i vy när index ändras
    effect(() => {
      const _ = this.activeIndex(); // trigger
      if (!this.open()) return;
      queueMicrotask(() => {
        const container = this.scrollEl?.nativeElement;
        if (!container) return;
        const arr = this.opts?.toArray();
        const el = arr?.[this.activeIndex()]?.nativeElement;
        if (!el) return;
        const cTop = container.scrollTop;
        const cBottom = cTop + container.clientHeight;
        const eTop = el.offsetTop;
        const eBottom = eTop + el.offsetHeight;
        if (eTop < cTop) container.scrollTop = eTop; else if (eBottom > cBottom) container.scrollTop = eBottom - container.clientHeight;
      });
    });
  }

  private updateOverlay() {
    const input = this.inputEl?.nativeElement; if (!input) return;
    const rect = input.getBoundingClientRect();
    const vh = window.innerHeight;
    const maxH = 256; // ~max-h-64
    let top = rect.bottom + 4;
    if (top + maxH > vh) { top = Math.max(8, rect.top - maxH - 4); }
    this.overlayPos.set({ top, left: rect.left, width: Math.max(rect.width, 200) });
  }
  openPicker() { this.open.set(true); this.activeIndex.set(0); this.updateOverlay(); }
  @HostListener('window:resize') onResize() { if (this.open()) this.updateOverlay(); }
  @HostListener('window:scroll') onWinScroll() { if (this.open()) this.updateOverlay(); }

  all = computed(() => this.items.byCategory(this.category));
  filtered = computed(() => {
    const s = this.search().toLowerCase();
    if (!s) return this.all().slice(0, 30);
    return this.all().filter(i => i.name.toLowerCase().includes(s)).slice(0, 30);
  });
  valueItem = computed(() => this.value() ? this.items.get(this.value()!) : null);

  onSearch(v: string) { this.search.set(v); if (!this.open()) { this.openPicker(); } else { this.updateOverlay(); } this.activeIndex.set(0); }
  select(it: Item) {
    this.value.set(it.id);
    this.selectedChange.emit(it.id);
    this.itemSelected.emit(it);
    this.search.set(it.name);
    this.open.set(false);
  }
  clear() {
    this.value.set(null); this.selectedChange.emit(null); this.itemSelected.emit(null); this.search.set('');
  }
  syncSearchFromValue() { const vi = this.valueItem(); if (vi) this.search.set(vi.name); }

  onKey(ev: KeyboardEvent) {
    if (!this.open()) {
      if (ev.key === 'ArrowDown') { this.open.set(true); ev.preventDefault(); }
      return;
    }
    if (ev.key === 'ArrowDown') { this.activeIndex.set(Math.min(this.filtered().length-1, this.activeIndex()+1)); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { this.activeIndex.set(Math.max(0, this.activeIndex()-1)); ev.preventDefault(); }
    else if (ev.key === 'Enter') { const it = this.filtered()[this.activeIndex()]; if (it) { this.select(it); ev.preventDefault(); } }
  else if (ev.key === 'Tab') { const it = this.filtered()[this.activeIndex()]; if (it) { this.select(it); } /* låt fokus gå vidare */ }
    else if (ev.key === 'Escape') { this.open.set(false); }
  }

  @HostListener('document:click', ['$event']) onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target)) this.open.set(false);
  }
}
