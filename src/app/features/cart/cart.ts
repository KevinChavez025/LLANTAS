import { Component, inject, computed } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { CarritoItem } from '../../core/models/carrito.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  private carritoService = inject(CarritoService);

  carrito$ = this.carritoService.carrito$;
  vacio    = computed(() => this.carritoService.getCarritoActual().items.length === 0);

  igv      = computed(() => Math.round(this.carritoService.getCarritoActual().subtotal * 0.18 * 100) / 100);
  total    = computed(() => Math.round((this.carritoService.getCarritoActual().subtotal + this.igv()) * 100) / 100);

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