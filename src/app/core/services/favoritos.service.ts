import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Producto } from '../models/producto.model';

/**
 * Servicio de favoritos — almacenado en localStorage por usuario.
 * No requiere backend: es local al navegador.
 * Clave: "favoritos_{userId}" para que cada usuario tenga sus propios.
 */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private auth = inject(AuthService);

  private _favoritos = signal<Producto[]>([]);
  readonly favoritos = this._favoritos.asReadonly();

  constructor() {
    this.cargarDesdeStorage();
  }

  private getKey(): string {
    const user = this.auth.getCurrentUser();
    return user ? `favoritos_${user.id}` : 'favoritos_guest';
  }

  private cargarDesdeStorage(): void {
    try {
      const raw = localStorage.getItem(this.getKey());
      this._favoritos.set(raw ? JSON.parse(raw) : []);
    } catch {
      this._favoritos.set([]);
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(this.getKey(), JSON.stringify(this._favoritos()));
    } catch {}
  }

  /** Recargar cuando el usuario hace login */
  recargar(): void {
    this.cargarDesdeStorage();
  }

  esFavorito(productoId: number): boolean {
    return this._favoritos().some(p => p.id === productoId);
  }

  toggleFavorito(producto: Producto): void {
    if (this.esFavorito(producto.id)) {
      this._favoritos.update(lista => lista.filter(p => p.id !== producto.id));
    } else {
      this._favoritos.update(lista => [...lista, producto]);
    }
    this.guardarEnStorage();
  }

  eliminar(productoId: number): void {
    this._favoritos.update(lista => lista.filter(p => p.id !== productoId));
    this.guardarEnStorage();
  }

  limpiar(): void {
    this._favoritos.set([]);
    this.guardarEnStorage();
  }
}