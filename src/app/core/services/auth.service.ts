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
  rol: string;
}

// ✅ Coincide exactamente con lo que devuelve el backend
export interface AuthResponse {
  accessToken: string;   // el backend lo llama accessToken
  refreshToken: string;
  type: string;
  id: number;
  username: string;
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

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refreshToken') : null;
  }

  private save(res: AuthResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem('accessToken', res.accessToken);  // ✅ res.accessToken
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    const user: User = { id: res.id, email: res.email, nombre: res.nombre, rol: res.rol };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clear(): void {
    if (!this.isBrowser) return;
    ['accessToken', 'refreshToken', 'user'].forEach(k => localStorage.removeItem(k));
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

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('Sin refresh token'));
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(tap(res => this.save(res)));
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