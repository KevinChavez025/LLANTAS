import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';

export const routeFadeAnimation = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0 }),
      animate('180ms ease-out', style({ opacity: 1 }))
    ], { optional: true }),
    query(':leave', [
      animate('80ms ease-in', style({ opacity: 0 }))
    ], { optional: true }),
  ])
]);

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  animations: [routeFadeAnimation]
})
export class MainLayout {
  getRouteState(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('/') : '';
  }
}