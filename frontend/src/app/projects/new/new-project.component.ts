import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project.component.html'
})
export class NewProjectComponent {
  model = {
    name: '',
    customerName: '',
    customerRequestedDeliveryDate: '',
    notes: ''
  };

  saving = false;

  saveMock() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      alert('Mock: Projekt sparat (ej backend)');
    }, 800);
  }
}
