import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = false;

  get userName(): string {
    return this.authService.getCurrentUser()?.nombre ?? 'Admin';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  logout(): void {
    this.authService.logout();
  }
}