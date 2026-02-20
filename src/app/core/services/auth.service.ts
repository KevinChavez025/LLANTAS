import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string; // 'ADMIN' | 'USER'
}

/**
 * Respuesta real del backend:
 * { token, type, id, username, email, nombre, rol }
 * El backend NO usa accessToken/refreshToken — solo un JWT estático.
 */
export interface AuthResponse {
  token: string;       // JWT — el backend lo llama "token", no "accessToken"
  type: string;        // "Bearer"
  id: number;
  username: string;    // = email (alias)
  email: string;
  nombre: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http       = inject(HttpClient);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);

  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  // ── Storage ───────────────────────────────────────────────
  private loadUser(): User | null {
    if (!this.isBrowser) return null;
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }
  }

  /** Devuelve el token JWT almacenado (guardado como 'accessToken' por compatibilidad con interceptor) */
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  private save(res: AuthResponse): void {
    if (!this.isBrowser) return;
    // Guardamos res.token como 'accessToken' para que el interceptor lo encuentre
    localStorage.setItem('accessToken', res.token);
    const user: User = { id: res.id, email: res.email, nombre: res.nombre, rol: res.rol };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clear(): void {
    if (!this.isBrowser) return;
    ['accessToken', 'user'].forEach(k => localStorage.removeItem(k));
    this.currentUserSubject.next(null);
  }

  // ── API ───────────────────────────────────────────────────
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.save(res)));
  }

  register(data: { nombre: string; email: string; password: string; telefono?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap(res => this.save(res)));
  }

  /**
   * El backend actual NO implementa refresh de token.
   * Este método existe por compatibilidad con el interceptor:
   * si recibe 401, simplemente hace logout.
   */
  refresh(): Observable<AuthResponse> {
    return throwError(() => new Error('Refresh no disponible — inicia sesión nuevamente'));
  }

  logout(): void {
    this.clear();
    this.router.navigate(['/login']);
  }

  // ── Helpers ───────────────────────────────────────────────
  getCurrentUser(): User | null { return this.currentUserSubject.value; }
  isAuthenticated(): boolean    { return !!this.getToken() && !!this.getCurrentUser(); }
  isAdmin(): boolean            { return this.getCurrentUser()?.rol === 'ADMIN'; }
}
