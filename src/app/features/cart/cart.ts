import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { Carrito, CarritoItem } from '../../core/models/carrito.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  private carritoService = inject(CarritoService);

  // ✅ Un único observable — todo el template se actualiza reactivamente
  carrito$ = this.carritoService.carrito$;

  // ✅ Métodos puros que reciben el carrito del template (sin leer estado interno)
  igv(carrito: Carrito): number {
    return Math.round(carrito.subtotal * 0.18 * 100) / 100;
  }

  total(carrito: Carrito): number {
    return Math.round((carrito.subtotal + this.igv(carrito)) * 100) / 100;
  }

  actualizar(item: CarritoItem, delta: number): void {
    this.carritoService.actualizarCantidad(item.id, item.cantidad + delta);
  }

  eliminar(itemId: number): void {
    this.carritoService.eliminarItem(itemId);
  }

  vaciar(): void {
    this.carritoService.vaciar();
  }
}