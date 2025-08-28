import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectMockService } from '../project-mock.service';
import { AreaMockService } from '../area-mock.service';

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

  constructor(private projects: ProjectMockService, private areas: AreaMockService, private router: Router) {}

  saveMock() {
    this.saving = true;
    setTimeout(() => {
      const project = this.projects.addProject({
        name: this.model.name,
        customerName: this.model.customerName,
        customerRequestedDeliveryDate: this.model.customerRequestedDeliveryDate || undefined
      });
      // Skapa default Område + Position
      const area = this.areas.addArea(project.id, 'Område 1');
      if (area) this.areas.addPosition(area.id, 'Pos 1');
      this.saving = false;
      this.router.navigate(['/projekt', project.id]);
    }, 800);
  }
}
