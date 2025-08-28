# Shadely Design Guidelines

Syfte: Säkerställa en modern, fräsch och minimalistisk SaaS‑känsla (clean, lugn, tydlig) som skalar från MVP till full produkt utan omtag. Kodidentifierare på engelska; UI‑copy på svenska.

## 1. Designprinciper

1. Låg kognitiv belastning – ett visuellt fokus per vy.
2. Tydlig hierarki – spacing + typografi först; färg sekundärt.
3. Konsistens före variation – återanvänd komponentmönster.
4. Progressiv fördjupning – visa summering först, detaljer på interaktion.
5. Mörkt & ljust läge jämlika – undvik hårda färgmixar; lita på tokens.
6. Tillgänglighet – WCAG AA (kontrast ≥ 4.5:1 för text < 24px).

## 2. Typografi

Primär font: Inter (variable). Sans‑serif, neutral, läsbar.

| Semantik | Tailwind klass | Storlek (rem) | Vikt | Användning |
|----------|---------------|---------------|------|-----------|
| h1 | text-3xl md:text-4xl | 1.875–2.25 | 600 | Sidrubik |
| h2 | text-2xl md:text-3xl | 1.5–1.875 | 600 | Sektion |
| h3 | text-xl md:text-2xl | 1.25–1.5 | 600 | Underrubik |
| Lead | text-lg | 1.125 | 400/500 | Ingress / sammanfattning |
| Body | text-base | 1.0 | 400 | Brödtext |
| Small | text-sm | 0.875 | 500 | Metadata / label |
| Mono (tal) | font-mono tabular-nums | system | 500 | Nyckeltal |

Line-height: låt Tailwind defaults vara (≈1.25–1.5). Maximera läsbarhet, minimera visuellt brus.

## 3. Färg & Tokens

Använd bara semantiska DaisyUI klasser (btn-primary, bg-base-100, text-base-content). Introducerade/justerade tokens i `tailwind.config.cjs`:

| Token | Light | Dark | Användning |
|-------|-------|------|-----------|
| base-100 | #FFFFFF | #0F172A | Primär bakgrund panel |
| base-200 | #F1F5F9 | #152033 | Sekundär bakgrund (layout) |
| base-300 | #E2E8F0 | #1E293B | Avgränsning / border-lik yta |
| primary | #3F6B9E | #64A5FF | Primär CTA / fokus |
| accent | #D97706 | #F59E0B | Highlight / aktiv state |
| neutral | #374151 | #1E293B | Ikon / text-subtle |

State färger (info/success/warning/error) använder DaisyUI defaults; undvik egna hex i komponenter.

### Färg-användning

- Endast en stark färgaccent (primary) per vy.
- Sekundär färg (secondary) = stödjande, ej CTA.
- Accent används sparsamt: badge, markerad rad, fokusbakgrund.
- Undvik fler än tre färgnyanser samtidigt i en tabell / sektion.

## 4. Spacing & Layout

Basenhet: 4px (0.25rem). Rekommenderad vertikal rytm:

| Semantik | Klass (Tailwind) | px |
|----------|------------------|----|
| XS | gap-1 / p-1 | 4 |
| S | gap-2 / p-2 | 8 |
| M | gap-4 / p-4 | 16 |
| L | gap-6 / p-6 | 24 |
| XL | gap-8 / p-8 | 32 |
| XXL | gap-12 / p-12 | 48 |

Containerbredd: max-w-7xl för huvudvyer; centrera med `mx-auto px-4 md:px-6`.

## 5. Komponentmönster

| Mönster | Riktlinje |
|---------|----------|
| Stat Card | `shadow-sm hover:shadow-md transition` + border (base-300) i ljus; tonad bakgrund i mörk. Ikon vänster, siffra prominent. |
| Panels | `rounded-lg bg-base-100 shadow-sm border border-base-300/60` (ljus) / `border-base-300/30` (mörk). |
| Tabeller | Minimalistisk: zebra-stripes endast vid > 10 rader. Rad-hover: `bg-base-200/60`. Sorterbar kolumn visar `text-primary` + liten caret ikon. |
| Dialog/Modal | Max 640px bredd (max-w-lg), `p-6`, fokusfälla, `data-theme` följer root. |
| Forms | Vertikal stack; labels `text-sm font-medium`, inputs full width; hjälptext `text-xs text-base-content/70`. Fel: `text-error` + röd kant. |
| Badges | Status → DaisyUI badge med färg mappad mot domänstatus (ex ProductionOrderStatus.InProgress → badge-info). |

## 6. Interaktionsprinciper

- Hover ≠ Primary: höj subtilt (shadow + liten ytförändring) istället för färgexplosion.
- Fokus: outline ring med `outline outline-2 outline-primary/60 offset` (DaisyUI ring utilities) – konsekvent för tangentbord.
- Animera endast layout-in/ut & kritiska feedback (typ att en rad läggs till). Max 150–200ms, easing: `cubic-bezier(0.4,0,0.2,1)`.

## 7. Ikoner

Heroicons (outline) föredras; fyllnad endast vid aktiv/markerad state. Storlekar: 20px (default), 16px (kompakt), 24px (feature hero). Klass: `w-5 h-5 text-base-content/70`.

## 8. Data & Tal

- Använd tabular-nums för siffror i kolumner: `font-mono tabular-nums`.
- Visning av pengar: `123 456 kr` (mellanslag tusental, ingen decimal om heltal). Kommer senare formaliseras.

## 9. Dark Mode

- Testa kontrast på primära kort och tabellrader.
- Undvik helsvarta (#000) eller helvita (#fff) textblock på stora ytor—använd base-content via tema.

## 10. Tillgänglighet & Läsbarhet

| Check | Regel |
|-------|-------|
| Kontrast | Min 4.5:1 text normal, 3:1 > 24px / semibold |
| Fokus | Alla interaktiva element synlig ring |
| Hit Area | Min 40×40px klickyta på primära actions |
| Tangentbord | Navigerbar sekventiellt & ESC stänger dialog |

## 11. Namngivning i Kod

Använd semantiska komponentnamn (ProductionOrderCard, InventoryShortageList). Ingen hårdkodad färg i komponenter – använd klasser.

## 12. Implementation Checklista (PR)

- [ ] Inga hex-färger i komponent (undantag temp mockdiagram)
- [ ] Använder spacing-skalan korrekt
- [ ] Typografi följer tabellen
- [ ] Dark mode visuellt likvärdigt
- [ ] Fokusstil finns på nya interaktiva element
- [ ] Statusfärger via DaisyUI badges

## 13. Framtida Utökning

Planerade tokens: chart färgpalett, elevations (shadow-lg varianter), densitetsläge (compact mode), skeleton loading komponent.

---
Justera dokumentet när backend inför pivot i entitetsstruktur eller när nya produktområden (mätning/mobil) kräver alternativa mönster.
