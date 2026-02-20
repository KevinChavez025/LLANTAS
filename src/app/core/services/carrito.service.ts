import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Carrito, CarritoItem } from '../models/carrito.model';
import { Producto } from '../models/producto.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

/**
 * Respuesta del backend para el carrito:
 * { items: CarritoItem[], total: number, cantidadItems: number }
 */
interface BackendCarritoResponse {
  items: CarritoItem[];
  total: number;
  cantidadItems: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);
  private http       = inject(HttpClient);
  private auth       = inject(AuthService);

  private readonly base = `${environment.apiUrl}/api/carrito`;

  private subject = new BehaviorSubject<Carrito>(this.fromStorage());
  carrito$ = this.subject.asObservable();

  // ── SessionId para usuarios invitados ────────────────────
  getSessionId(): string {
    if (!this.isBrowser) return '';
    let sid = localStorage.getItem('sessionId');
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('sessionId', sid); }
    return sid;
  }

  // ── Storage local (UI reactiva) ───────────────────────────
  private fromStorage(): Carrito {
    if (!this.isBrowser) return this.empty();
    try { return JSON.parse(localStorage.getItem('carrito') ?? 'null') ?? this.empty(); }
    catch { return this.empty(); }
  }

  private empty(): Carrito { return { items: [], cantidadItems: 0, subtotal: 0, total: 0 }; }

  private calc(items: CarritoItem[]): Carrito {
    const subtotal      = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
    const cantidadItems = items.reduce((s, i) => s + i.cantidad, 0);
    return { items, cantidadItems, subtotal, total: subtotal };
  }

  private save(c: Carrito): void {
    if (this.isBrowser) localStorage.setItem('carrito', JSON.stringify(c));
    this.subject.next(c);
  }

  // ── API pública ───────────────────────────────────────────
  getCarritoActual(): Carrito { return this.subject.value; }
  getCantidadItems(): number  { return this.subject.value.cantidadItems; }

  /**
   * Agrega un producto al carrito.
   * - Si hay usuario autenticado → llama al backend (POST /api/carrito/agregar/usuario/{id})
   * - Si es invitado → llama al backend (POST /api/carrito/agregar?sessionId=...)
   * En ambos casos actualiza el estado local para UI reactiva.
   */
  agregarProducto(p: Producto, cantidad = 1): void {
    const usuario = this.auth.getCurrentUser();
    const params  = new HttpParams().set('productoId', p.id).set('cantidad', cantidad);

    if (usuario) {
      this.http.post<CarritoItem>(`${this.base}/agregar/usuario/${usuario.id}`, null, { params })
        .subscribe({ next: () => this.agregarLocal(p, cantidad) });
    } else {
      const paramsInvitado = params.set('sessionId', this.getSessionId());
      this.http.post<CarritoItem>(`${this.base}/agregar`, null, { params: paramsInvitado })
        .subscribe({ next: () => this.agregarLocal(p, cantidad) });
    }
  }

  /** Agrega localmente para reflejar en UI sin esperar round-trip */
  private agregarLocal(p: Producto, cantidad: number): void {
    const items = [...this.subject.value.items];
    const idx   = items.findIndex(i => i.producto.id === p.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], cantidad: Math.min(items[idx].cantidad + cantidad, p.stock) };
    } else {
      const cant = Math.min(cantidad, p.stock);
      items.push({ id: Date.now(), producto: p, cantidad: cant,
                   precioUnitario: p.precio, subtotal: p.precio * cant,
                   fechaAgregado: new Date().toISOString() });
    }
    this.save(this.calc(items));
  }

  /**
   * Actualiza cantidad de un item.
   * Si itemId es un id del backend (número grande real) → llama API.
   * También actualiza el estado local.
   */
  actualizarCantidad(id: number, cantidad: number): void {
    if (cantidad < 1) { this.eliminarItem(id); return; }
    // Actualizar en el backend si existe en BD (ids del backend suelen ser < Date.now())
    this.http.put<CarritoItem>(`${this.base}/item/${id}`, null, {
      params: new HttpParams().set('cantidad', cantidad)
    }).subscribe({ error: () => {} }); // silenciar error si id es local
    this.save(this.calc(this.subject.value.items.map(i => i.id === id ? { ...i, cantidad } : i)));
  }

  eliminarItem(id: number): void {
    this.http.delete(`${this.base}/item/${id}`).subscribe({ error: () => {} });
    this.save(this.calc(this.subject.value.items.filter(i => i.id !== id)));
  }

  vaciar(): void {
    const usuario = this.auth.getCurrentUser();
    if (usuario) {
      this.http.delete(`${this.base}/vaciar/usuario/${usuario.id}`).subscribe({ error: () => {} });
    } else {
      const sid = this.getSessionId();
      this.http.delete(`${this.base}/vaciar`, { params: new HttpParams().set('sessionId', sid) })
        .subscribe({ error: () => {} });
    }
    if (this.isBrowser) localStorage.removeItem('carrito');
    this.subject.next(this.empty());
  }

  // ── Cargar carrito desde backend (llamar al iniciar sesión) ──
  cargarDesdeBackend(): void {
    const usuario = this.auth.getCurrentUser();
    if (usuario) {
      this.http.get<BackendCarritoResponse>(`${this.base}/usuario/${usuario.id}`)
        .subscribe({ next: r => this.save(this.calc(r.items ?? [])), error: () => {} });
    }
  }
}
