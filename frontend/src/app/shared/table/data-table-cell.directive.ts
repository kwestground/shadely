import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[dataTableCell]',
  standalone: true
})
export class DataTableCellTemplateDirective {
  @Input('dataTableCell') field!: string;
  constructor(public readonly template: TemplateRef<any>) {}
}
