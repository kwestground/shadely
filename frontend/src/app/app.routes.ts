import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers.component';
import { NewCustomerComponent } from './customers/new/new-customer.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'kunder', component: CustomersComponent },
  { path: 'kunder/ny', component: NewCustomerComponent },
  { path: '**', redirectTo: '' }
];
