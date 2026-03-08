import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private auth   = inject(AuthService);
  private toastr = inject(ToastrService);

  seccionActiva = signal<'cuenta' | 'notificaciones' | 'privacidad'>('cuenta');

  // Cuenta
  emailActual    = '';
  nuevaPassword  = '';
  confirmarPass  = '';
  mostrarPass    = false;
  guardando      = signal(false);

  // Notificaciones (preferencias locales)
  notifPedidos   = true;
  notifOfertas   = false;
  notifWhatsapp  = true;

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.emailActual = user?.email || '';
  }

  cambiarSeccion(s: 'cuenta' | 'notificaciones' | 'privacidad') {
    this.seccionActiva.set(s);
  }

  guardarNotificaciones() {
    this.toastr.success('Preferencias de notificaciones guardadas', 'Listo');
  }

  cerrarSesion() {
    this.auth.logout();
  }
}
