import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Producto } from '../models/producto.model';
import { environment } from '../../../environments/environment';

interface FavoritoResponse {
  id: number;
  productoId: number;
  nombre: string;
  marca: string;
  modelo?: string;
  tipoVehiculo?: string;
  medida?: string;
  categoria?: string;
  precio: number;
  stock: number;
  disponible: boolean;
  esNuevo: boolean;
  esDestacado: boolean;
  urlImagen?: string;
  fechaAgregado: string;
}

function toProducto(r: FavoritoResponse): Producto {
  return {
    id: r.productoId, nombre: r.nombre, marca: r.marca, modelo: r.modelo,
    tipoVehiculo: r.tipoVehiculo, medida: r.medida, categoria: r.categoria,
    precio: r.precio, stock: r.stock, disponible: r.disponible,
    esNuevo: r.esNuevo, esDestacado: r.esDestacado, urlImagen: r.urlImagen,
  };
}

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private auth       = inject(AuthService);
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);

  private readonly base = `${environment.apiUrl}/api/favoritos`;

  private _favoritos = signal<Producto[]>([]);
  readonly favoritos = this._favoritos.asReadonly();

  private getLocalKey(): string {
    const user = this.auth.getCurrentUser();
    return user ? `favoritos_${user.id}` : 'favoritos_guest';
  }

  /** Llamar al hacer login: fusiona localStorage con backend */
  sincronizarAlLogin(): void {
    const user = this.auth.getCurrentUser();
    if (!user || !this.isBrowser) return;

    let idsLocales: number[] = [];
    try {
      const raw = localStorage.getItem(this.getLocalKey());
      const local: Producto[] = raw ? JSON.parse(raw) : [];
      idsLocales = local.map(p => p.id);
    } catch { /* ignorar */ }

    this.http.post<FavoritoResponse[]>(
      `${this.base}/usuario/${user.id}/sincronizar`,
      { productoIds: idsLocales }
    ).subscribe({
      next: lista => {
        this._favoritos.set(lista.map(toProducto));
        localStorage.removeItem(this.getLocalKey());
      },
      error: () => this.cargarDesdeBackend()
    });
  }

  cargarDesdeBackend(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.http.get<FavoritoResponse[]>(`${this.base}/usuario/${user.id}`)
      .subscribe({ next: lista => this._favoritos.set(lista.map(toProducto)), error: () => {} });
  }

  limpiarAlLogout(): void {
    this._favoritos.set([]);
  }

  esFavorito(productoId: number): boolean {
    return this._favoritos().some(p => p.id === productoId);
  }

  toggleFavorito(producto: Producto): void {
    if (this.esFavorito(producto.id)) {
      this.eliminar(producto.id);
    } else {
      this.agregar(producto);
    }
  }

  agregar(producto: Producto): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this._favoritos.update(lista => [...lista, producto]);
    this.http.post<FavoritoResponse>(
      `${this.base}/usuario/${user.id}/producto/${producto.id}`, {}
    ).subscribe({
      error: () => this._favoritos.update(lista => lista.filter(p => p.id !== producto.id))
    });
  }

  eliminar(productoId: number): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    const previo = [...this._favoritos()];
    this._favoritos.update(lista => lista.filter(p => p.id !== productoId));
    this.http.delete(`${this.base}/usuario/${user.id}/producto/${productoId}`)
      .subscribe({ error: () => this._favoritos.set(previo) });
  }

  limpiar(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    const previo = [...this._favoritos()];
    this._favoritos.set([]);
    this.http.delete(`${this.base}/usuario/${user.id}`)
      .subscribe({ error: () => this._favoritos.set(previo) });
  }
}