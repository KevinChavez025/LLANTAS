import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';

interface Categoria {
  nombre: string;
  query: string;
  svg: SafeHtml;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  private sanitizer = inject(DomSanitizer);

  isMenuOpen = false;
  cartCount = 0;
  isAuthenticated = false;
  isAdmin = false;
  userName = '';

  constructor(
    public authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdmin = this.authService.isAdmin();
      this.userName = user?.nombre || user?.email || '';
    });

    this.carritoService.carrito$.subscribe(carrito => {
      this.cartCount = carrito?.cantidadItems || 0;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  private s(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  readonly categorias: Categoria[] = [
    {
  nombre: 'Automóvil',
  query: 'Auto',
  svg: this.s(`<svg viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M8.342,22L2,22C1.47,22 0.961,21.789 0.586,21.414C0.211,21.039 0,20.53 0,20C0,16.707 0,10.282 0,8C0,7.47 0.211,6.961 0.586,6.586C1.938,5.234 5.321,1.851 7.414,-0.243C8.539,-1.368 10.066,-2 11.657,-2C16.201,-2 25.799,-2 30.343,-2C31.934,-2 33.461,-1.368 34.586,-0.243L40.828,6L44,6L46,6C47.591,6 49.117,6.632 50.243,7.757C51.368,8.883 52,10.409 52,12C52,14.822 52,17.999 52,20C52,20.53 51.789,21.039 51.414,21.414C51.039,21.789 50.53,22 50,22L43.658,22C42.834,24.329 40.61,26 38,26C35.39,26 33.166,24.329 32.342,22L19.658,22C18.834,24.329 16.61,26 14,26C11.39,26 9.166,24.329 8.342,22ZM38,18C36.896,18 36,18.896 36,20C36,21.104 36.896,22 38,22C39.104,22 40,21.104 40,20C40,18.896 39.104,18 38,18ZM14,18C12.896,18 12,18.896 12,20C12,21.104 12.896,22 14,22C15.104,22 16,21.104 16,20C16,18.896 15.104,18 14,18ZM43.658,18L48,18L48,12C48,10.895 47.105,10 46,10L39.172,10L22,10C20.895,10 20,9.105 20,8C20,7.47 20.211,6.961 20.586,6.586C20.961,6.211 21.47,6 22,6C26.12,6 35.172,6 35.172,6C35.172,6 32.868,3.697 31.757,2.586C31.382,2.211 30.874,2 30.343,2C27.055,2 14.945,2 11.657,2C11.126,2 10.618,2.211 10.243,2.586C8.588,4.24 4,8.828 4,8.828L4,18L8.342,18C9.166,15.671 11.39,14 14,14C16.61,14 18.834,15.671 19.658,18L32.342,18C33.166,15.671 35.39,14 38,14C40.61,14 42.834,15.671 43.658,18Z"/>
  </svg>`)
    },
    {
      nombre: 'Moto / ATV',
      query: 'Moto',
      svg: this.s(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18,7 22,7 27,22"/>
        <circle cx="27" cy="22" r="4"/>
        <circle cx="5" cy="22" r="4"/>
        <path d="M5,14c4.4,0,8,3.6,8,8h6c0-4.4,3.6-8,8-8c0.8,0,1.7,0.1,2.4,0.4"/>
        <path d="M23,11h-6l-0.4,0.6c-1.6,2.6-4.6,4-7.6,3.4"/>
      </svg>`)
    },
    {
      nombre: 'Camión / Bus',
      query: 'Camion',
      svg: this.s(`<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <polygon points="352,208 352,256 352,272 448,272 448,256 416.721,208"/>
        <path d="m510.078,231.766l-47.82-80c-2.891-4.82-7.922-7.766-13.539-7.766h-128.719v-64c0-8.836-6.445-16-15.281-16
          h-288c-8.836,0-16.719,7.164-16.719,16v304c0,8.836 7.883,16 16.719,16h66.272c7.156,27.523 31.995,48 61.728,48
          c29.732,0 54.571-20.477 61.728-48h98.273 34.272c7.156,27.523 31.995,48 61.728,48c29.732,0 54.571-20.477 61.727-48
          h34.273c8.836,0 15.281-7.164 15.281-16v-144c-0.001-2.898-0.431-5.742-1.923-8.234z
          m-478.078-135.766h256v64 208h-81.554c-7.156-27.523-31.995-48-61.728-48c-29.732,0-54.571,20.477-61.728,48
          h-50.99v-272zm112.719,320c-17.648,0-32-14.352-32-32s14.351-32 32-32c17.648,0 32,14.352 32,32s-14.352,32-32,32z
          m256,0c-17.648,0-32-14.352-32-32s14.352-32 32-32c17.648,0 32,14.352 32,32s-14.352,32-32,32z
          m79.281-48h-17.554c-7.156-27.523-31.995-48-61.727-48c-29.733,0-54.571,20.477-61.728,48h-18.991v-192
          h119.656l40.344,68.43v123.57z"/>
      </svg>`)
    },
    {
      nombre: '4x4 / SUV',
      query: 'SUV',
      svg: this.s(`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
        <line x1="17" y1="9" x2="15" y2="6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
        <path d="M19,16h1a1,1,0,0,0,1-1V10a1,1,0,0,0-1-1H14v1a1,1,0,0,1-1,1H11.41a1,1,0,0,1-.7-.29L9.29,9.29A1,1,0,0,0,8.59,9H4a1,1,0,0,0-1,1v5a1,1,0,0,0,1,1H5"
          stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>
        <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
        <path d="M7,14a2,2,0,1,0,2,2A2,2,0,0,0,7,14Zm10,0a2,2,0,1,0,2,2A2,2,0,0,0,17,14Z"
          stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>
      </svg>`)
    },
    {
      nombre: 'Minería',
      query: 'Mineria',
      svg: this.s(`<svg viewBox="0 0 451.679 451.679" xmlns="http://www.w3.org/2000/svg" fill="currentColor" transform="matrix(-1,0,0,1,0,0)">
        <path d="m451.395,290.766l-19.16-88.23c-1.248-5.747-6.334-9.847-12.215-9.847h-22.883v-41.566c0-6.903-5.596-12.5-12.5-12.5
          s-12.5,5.597-12.5,12.5v41.566h-40.46v-81.566c0-6.904-5.597-12.5-12.5-12.5h-70.857c-5.468,0-10.301,3.554-11.932,8.773
          l-26.64,85.293h-36.568c-5.846,0-10.911,4.051-12.195,9.754l-14.221,63.166h-6.472c-0.756-17.73-7.945-34.3-20.506-47.025
          c-13.521-13.697-31.565-21.241-50.81-21.241c-6.904,0-12.5,5.597-12.5,12.5c0,36.928-9.552,73.188-27.67,105.286h-16.306
          c-6.903,0-12.5,5.596-12.5,12.5s5.597,12.5,12.5,12.5h55.597c31.965,0,59.359-20.862,68.779-49.52h4.017
          c-0.044,0.933-0.071,1.871-0.071,2.815c0,32.882,26.751,59.633,59.633,59.633c28.596,0,52.545-20.236,58.305-47.137h33.245
          c5.76,26.901,29.71,47.137,58.305,47.137c28.596,0,52.546-20.236,58.306-47.138h30.562c3.781,0,7.359-1.711,9.731-4.655
          c2.375-2.944,3.288-6.803,2.486-10.498z
          m-383.298,24.363h-11.04c13.964-28.486,22.134-59.491,24.004-91.207c7.862,2.105,15.055,6.27,20.933,12.224
          c8.784,8.899,13.533,20.693,13.37,33.209c-0.328,25.24-21.531,45.774-47.267,45.774z
          m189.413-191.506h49.166v69.066h-70.738l21.572-69.066z
          m-57.055,204.434c-19.097,0-34.633-15.537-34.633-34.633s15.537-34.633,34.633-34.633s34.633,15.537,34.633,34.633
          s-15.536,34.633-34.633,34.633z
          m149.856,0c-19.097,0-34.633-15.537-34.633-34.633s15.537-34.633,34.633-34.633s34.633,15.537,34.633,34.633
          s-15.536,34.633-34.633,34.633z
          m58.304-47.138c-5.763-26.897-29.711-47.128-58.304-47.128c-28.593,0-52.541,20.232-58.304,47.13h-33.248
          c-5.763-26.898-29.711-47.13-58.304-47.13c-7.708,0-15.071,1.486-21.839,4.16l4.562-20.262h135.999h90.766l13.731,63.23h-15.059z"/>
      </svg>`)
    },
  ];
}