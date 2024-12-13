import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';  // Importando o HomeComponent

@Component({
  selector: 'app-dashboard',
  standalone: true,  // Indicando que o componente é standalone
  imports: [CommonModule, ReactiveFormsModule, HomeComponent],  // Importando os módulos necessários
  template: '<app-home></app-home>',  // Usando o HomeComponent diretamente no template
  styleUrls: ['./dashboard.component.css']  // Defina o estilo conforme necessário
})
export class DashboardComponent { }