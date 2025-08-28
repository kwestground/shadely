import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-customer.component.html'
})
export class NewCustomerComponent {
  model = {
    name: '',
    orgNr: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  };

  saving = false;

  saveMock() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      alert('Mock: Kund sparad (ej backend)');
    }, 800);
  }
}
