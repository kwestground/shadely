import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { NewCustomerComponent } from './customers/new/new-customer.component';
import { ProjectsComponent } from './projects/projects.component';
import { NewProjectComponent } from './projects/new/new-project.component';
import { ProjectDetailComponent } from './projects/project-detail.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'kunder', component: CustomersComponent },
  { path: 'kunder/ny', component: NewCustomerComponent },
  { path: 'projekt', component: ProjectsComponent },
  { path: 'projekt/ny', component: NewProjectComponent },
  { path: 'projekt/:id', component: ProjectDetailComponent },
  { path: '**', redirectTo: '' }
];
