import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, CrearProductoDTO } from '../models/producto.model';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/productos`;

  // ── Públicos ──────────────────────────────────────────────
  obtenerPaginado(page = 0, size = 20): Observable<Page<Producto>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'nombre,asc');
    return this.http.get<Page<Producto>>(this.base, { params });
  }

  /** Shortcut: primer página completa → array (home/catálogo) */
  obtenerTodos(): Observable<Producto[]> {
    return this.obtenerPaginado(0, 100).pipe(map(p => p.content));
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.base}/${id}`);
  }

  obtenerDestacados(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/destacados`);
  }

  obtenerNuevos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/nuevos`);
  }

  obtenerDisponibles(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/disponibles`);
  }

  obtenerPorTipoVehiculo(tipo: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/tipo-vehiculo/${encodeURIComponent(tipo)}`);
  }

  buscar(q: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/buscar`, {
      params: new HttpParams().set('q', q)
    });
  }

  // ── Admin ─────────────────────────────────────────────────
  crear(dto: CrearProductoDTO): Observable<Producto> {
    return this.http.post<Producto>(this.base, dto);
  }

  actualizar(id: number, dto: Partial<CrearProductoDTO>): Observable<Producto> {
    return this.http.put<Producto>(`${this.base}/${id}`, dto);
  }

  /** Soft delete: marca disponible=false */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
