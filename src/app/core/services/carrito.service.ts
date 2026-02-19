import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Carrito, CarritoItem } from '../models/carrito.model';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);

  private carritoSubject = new BehaviorSubject<Carrito>(this.getFromStorage());
  public carrito$ = this.carritoSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/api/carrito`;

  // ── Helpers locales ──────────────────────────────

  private getFromStorage(): Carrito {
    if (!this.isBrowser) return this.carritoVacio();
    try {
      const json = localStorage.getItem('carrito');
      return json ? JSON.parse(json) : this.carritoVacio();
    } catch {
      return this.carritoVacio();
    }
  }

  private carritoVacio(): Carrito {
    return { items: [], cantidadItems: 0, subtotal: 0, total: 0 };
  }

  private recalcular(items: CarritoItem[]): Carrito {
    const subtotal     = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
    const cantidadItems = items.reduce((s, i) => s + i.cantidad, 0);
    return { items, cantidadItems, subtotal, total: subtotal };
  }

  private guardar(carrito: Carrito): void {
    if (this.isBrowser) localStorage.setItem('carrito', JSON.stringify(carrito));
    this.carritoSubject.next(carrito);
  }

  // ── API pública ──────────────────────────────────

  getCarritoActual(): Carrito {
    return this.carritoSubject.value;
  }

  getCantidadItems(): number {
    return this.carritoSubject.value.cantidadItems;
  }

  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const items = [...this.carritoSubject.value.items];
    const idx   = items.findIndex(i => i.producto.id === producto.id);

    if (idx >= 0) {
      // Ya existe — sumar cantidad sin pasar el stock
      const nueva = Math.min(items[idx].cantidad + cantidad, producto.stock);
      items[idx] = { ...items[idx], cantidad: nueva };
    } else {
      const cantidadFinal = Math.min(cantidad, producto.stock);
      const nuevoItem: CarritoItem = {
        id:             Date.now(),
        producto,
        cantidad:       cantidadFinal,
        precioUnitario: producto.precio,
        subtotal:       producto.precio * cantidadFinal,
        fechaAgregado:  new Date().toISOString(),
      };
      items.push(nuevoItem);
    }

    this.guardar(this.recalcular(items));
  }

  actualizarCantidad(itemId: number, cantidad: number): void {
    if (cantidad < 1) { this.eliminarItem(itemId); return; }
    const items = this.carritoSubject.value.items.map(i =>
      i.id === itemId ? { ...i, cantidad } : i
    );
    this.guardar(this.recalcular(items));
  }

  eliminarItem(itemId: number): void {
    const items = this.carritoSubject.value.items.filter(i => i.id !== itemId);
    this.guardar(this.recalcular(items));
  }

  vaciar(): void {
    if (this.isBrowser) localStorage.removeItem('carrito');
    this.carritoSubject.next(this.carritoVacio());
  }
}