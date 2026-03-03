import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Carrito, CarritoItem } from '../models/carrito.model';
import { Producto } from '../models/producto.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

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
   * Espera la respuesta del backend para usar el ID real del item,
   * evitando que eliminar/actualizar fallen con 404.
   */
  agregarProducto(p: Producto, cantidad = 1): void {
    const usuario = this.auth.getCurrentUser();
    const params  = new HttpParams().set('productoId', p.id).set('cantidad', cantidad);

    if (usuario) {
      this.http.post<CarritoItem>(`${this.base}/agregar/usuario/${usuario.id}`, null, { params })
        .subscribe({
          next: (item) => this.agregarLocal(p, cantidad, item.id),  // ✅ usa id del backend
          error: (err) => console.error('Error al agregar al carrito:', err)
        });
    } else {
      const paramsInvitado = params.set('sessionId', this.getSessionId());
      this.http.post<CarritoItem>(`${this.base}/agregar`, null, { params: paramsInvitado })
        .subscribe({
          next: (item) => this.agregarLocal(p, cantidad, item.id),  // ✅ usa id del backend
          error: (err) => console.error('Error al agregar al carrito:', err)
        });
    }
  }

  /** Agrega localmente con el id real del backend para que eliminar/actualizar funcionen */
  private agregarLocal(p: Producto, cantidad: number, backendId: number): void {
    const items = [...this.subject.value.items];
    const idx   = items.findIndex(i => i.producto.id === p.id);
    if (idx >= 0) {
      // Actualizar cantidad y usar siempre el id del backend
      items[idx] = {
        ...items[idx],
        id: backendId,
        cantidad: Math.min(items[idx].cantidad + cantidad, p.stock),
        subtotal: items[idx].precioUnitario * Math.min(items[idx].cantidad + cantidad, p.stock)
      };
    } else {
      const cant = Math.min(cantidad, p.stock);
      items.push({
        id: backendId,           // ✅ id real del backend, no Date.now()
        producto: p,
        cantidad: cant,
        precioUnitario: p.precio,
        subtotal: p.precio * cant,
        fechaAgregado: new Date().toISOString()
      });
    }
    this.save(this.calc(items));
  }

  actualizarCantidad(id: number, cantidad: number): void {
    if (cantidad < 1) { this.eliminarItem(id); return; }
    this.http.put<CarritoItem>(`${this.base}/item/${id}`, null, {
      params: new HttpParams().set('cantidad', cantidad)
    }).subscribe({ error: () => {} });
    this.save(this.calc(this.subject.value.items.map(i =>
      i.id === id ? { ...i, cantidad, subtotal: i.precioUnitario * cantidad } : i
    )));
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