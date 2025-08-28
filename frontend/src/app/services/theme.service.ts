import { Injectable, signal, effect } from '@angular/core';

type Theme = 'shadelylight' | 'shadelydark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  currentTheme = signal<Theme>((localStorage.getItem('theme') as Theme) || 'shadelylight');

  constructor() {
    effect(() => {
      const t = this.currentTheme();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    });
  }

  toggle() {
    this.currentTheme.update(t => t === 'shadelylight' ? 'shadelydark' : 'shadelylight');
  }
}
