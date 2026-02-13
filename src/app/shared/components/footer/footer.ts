import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com' }
  ];

  quickLinks = [
    { label: 'Inicio', route: '/home' },
    { label: 'Catálogo', route: '/catalogo' },
    { label: 'Nosotros', route: '/nosotros' },
    { label: 'Contacto', route: '/contacto' }
  ];

  legalLinks = [
    { label: 'Términos y Condiciones', route: '/terminos' },
    { label: 'Política de Privacidad', route: '/privacidad' },
    { label: 'Política de Devoluciones', route: '/devoluciones' }
  ];
}
