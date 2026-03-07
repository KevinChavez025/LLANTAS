import { Component, inject, signal } from '@angular/core';
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

  carrito$ = this.carritoService.carrito$;

  // Confirmación de eliminación
  itemAEliminar = signal<number | null>(null);
  confirmarVaciar = signal(false);

  igv(carrito: Carrito): number {
    return Math.round(carrito.subtotal * 0.18 * 100) / 100;
  }

  total(carrito: Carrito): number {
    return Math.round((carrito.subtotal + this.igv(carrito)) * 100) / 100;
  }

  actualizar(item: CarritoItem, delta: number): void {
    this.carritoService.actualizarCantidad(item.id, item.cantidad + delta);
  }

  // Pide confirmación antes de eliminar
  pedirConfirmacionEliminar(itemId: number): void {
    this.itemAEliminar.set(itemId);
  }

  confirmarEliminar(): void {
    const id = this.itemAEliminar();
    if (id !== null) {
      this.carritoService.eliminarItem(id);
      this.itemAEliminar.set(null);
    }
  }

  cancelarEliminar(): void {
    this.itemAEliminar.set(null);
  }

  // Pide confirmación antes de vaciar
  pedirConfirmacionVaciar(): void {
    this.confirmarVaciar.set(true);
  }

  confirmarVaciarCarrito(): void {
    this.carritoService.vaciar();
    this.confirmarVaciar.set(false);
  }

  cancelarVaciar(): void {
    this.confirmarVaciar.set(false);
  }

  stockBajo(item: CarritoItem): boolean {
    return item.producto.stock > 0 && item.producto.stock <= 5;
  }

  stockInsuficiente(item: CarritoItem): boolean {
    return item.cantidad >= item.producto.stock;
  }

  whatsAppUrlCarrito(): string {
    const msg = encodeURIComponent('Hola, necesito ayuda con mi carrito de compra');
    return `https://wa.me/51923402825?text=${msg}`;
  }
}