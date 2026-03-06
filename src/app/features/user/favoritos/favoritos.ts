import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.scss'
})
export class Favoritos {
  private favoritosSvc = inject(FavoritosService);
  private carritoSvc   = inject(CarritoService);
  private toastr       = inject(ToastrService);

  favoritos = this.favoritosSvc.favoritos;
  total     = computed(() => this.favoritos().length);

  // Ids de productos que ya están en el carrito (para mostrar feedback)
  enCarrito = signal<Set<number>>(new Set());

  agregarAlCarrito(producto: Producto): void {
    this.carritoSvc.agregarProducto(producto, 1);
    this.enCarrito.update(set => new Set([...set, producto.id]));
    this.toastr.success(`"${producto.nombre}" añadido al carrito`, '¡Listo!');

    // Resetear el checkmark después de 2 segundos
    setTimeout(() => {
      this.enCarrito.update(set => {
        const next = new Set(set);
        next.delete(producto.id);
        return next;
      });
    }, 2000);
  }

  eliminarFavorito(producto: Producto): void {
    this.favoritosSvc.eliminar(producto.id);
    this.toastr.info(`"${producto.nombre}" eliminado de favoritos`);
  }

  limpiarTodo(): void {
    this.favoritosSvc.limpiar();
    this.toastr.info('Lista de favoritos limpiada');
  }

  trackById(_: number, p: Producto) { return p.id; }
}