import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Carrito, CarritoItem, AgregarCarritoRequest, ActualizarCarritoRequest } from '../models/carrito.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private carritoSubject = new BehaviorSubject<Carrito | null>(this.getCarritoFromStorage());
  public carrito$ = this.carritoSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/api/carrito`;

  constructor() {}

  private getCarritoFromStorage(): Carrito | null {
    if (!this.isBrowser) return null;
    const carritoJson = localStorage.getItem('carrito');
    return carritoJson ? JSON.parse(carritoJson) : null;
  }

  private saveCarritoToStorage(carrito: Carrito): void {
    if (this.isBrowser) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
    this.carritoSubject.next(carrito);
  }

  obtenerCarrito(): Observable<Carrito> {
    return this.http.get<Carrito>(this.apiUrl).pipe(
      tap(carrito => this.saveCarritoToStorage(carrito))
    );
  }

  agregarItem(productoId: number, cantidad: number = 1): Observable<Carrito> {
    const body: AgregarCarritoRequest = { productoId, cantidad };
    return this.http.post<Carrito>(`${this.apiUrl}/agregar`, body).pipe(
      tap(carrito => this.saveCarritoToStorage(carrito))
    );
  }

  actualizarCantidad(itemId: number, cantidad: number): Observable<Carrito> {
    const body: ActualizarCarritoRequest = { cantidad };
    return this.http.put<Carrito>(`${this.apiUrl}/item/${itemId}`, body).pipe(
      tap(carrito => this.saveCarritoToStorage(carrito))
    );
  }

  eliminarItem(itemId: number): Observable<Carrito> {
    return this.http.delete<Carrito>(`${this.apiUrl}/item/${itemId}`).pipe(
      tap(carrito => this.saveCarritoToStorage(carrito))
    );
  }

  vaciarCarrito(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vaciar`).pipe(
      tap(() => {
        if (this.isBrowser) {
          localStorage.removeItem('carrito');
        }
        this.carritoSubject.next(null);
      })
    );
  }

  getCarritoActual(): Carrito | null {
    return this.carritoSubject.value;
  }

  getCantidadItems(): number {
    return this.carritoSubject.value?.cantidadItems ?? 0;
  }
}