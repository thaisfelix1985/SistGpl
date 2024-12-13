import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './dashboard/home/home.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent },
  // { path: '', redirectTo: '/login', pathMatch: 'full' },

];
