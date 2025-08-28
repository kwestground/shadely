import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  loading = signal(false);
  cards = [
    { title: 'Aktiva Projekt', value: 12, icon: '📁', desc: 'Pågående denna vecka' },
    { title: 'Mätningar idag', value: 3, icon: '📏', desc: 'Planerade besök' },
    { title: 'Materialbrister', value: 5, icon: '⚠️', desc: 'Kräver inköp' },
    { title: 'Installationer', value: 2, icon: '🛠️', desc: 'Bokade pass' }
  ];
}
