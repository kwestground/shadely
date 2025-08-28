import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats ett tal som svenskt SEK‑belopp.
 * Exempel: 12345 -> "12 345 kr" (non‑breaking space via Intl)
 * Användning: {{ amount | sek }} eller {{ amount | sek:{decimals:2} }}
 */
@Pipe({
  name: 'sek',
  standalone: true
})
export class SekCurrencyPipe implements PipeTransform {
  private readonly baseFormatter = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  transform(value: number | string | null | undefined, opts?: { decimals?: number; showZeroDecimals?: boolean; }): string {
    if (value === null || value === undefined || value === '') return '';
    let num = typeof value === 'number' ? value : Number(String(value).replace(/\s|kr|SEK/g,'').replace(',', '.'));
    if (isNaN(num)) return '';
    const decimals = opts?.decimals ?? 0;
    const showZeroDecimals = opts?.showZeroDecimals ?? false;
    const formatter = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    let formatted = formatter.format(num);
    if (decimals === 0 && !showZeroDecimals) {
      // Ensure any trailing ",00" removed if locale would add (sv-SE normally doesn't when min=0, safe guard)
      formatted = formatted.replace(/,(00|0)\s*kr$/i, ' kr');
    }
    return formatted;
  }
}
