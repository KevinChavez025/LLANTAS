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
    { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/people/Haidainversiones/61587763911202/?rdid=ek144z2D0PoC2gmg&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AMEjxR6QW%2F' },
    { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/haidainversiones/' },
    { name: 'WhatsApp', icon: 'whatsapp', url: 'https://wa.me/51923402825' }
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