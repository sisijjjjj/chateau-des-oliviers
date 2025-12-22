import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AcceuilComponent } from './acceuil/acceuil';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AcceuilComponent],
  template: `
    <router-outlet></router-outlet>
  `
})
export class App {
  title = 'château des oliviers';
}