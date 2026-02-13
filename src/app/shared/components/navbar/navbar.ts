import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
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
    // Suscribirse al estado del usuario
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdmin = this.authService.isAdmin();
      this.userName = user?.nombreCompleto || user?.username || '';
    });

    // Suscribirse al carrito para obtener el contador
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
}
