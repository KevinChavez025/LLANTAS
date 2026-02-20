import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../../core/services/producto.service';
import { CarritoService } from '../../core/services/carrito.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {
  private productoService = inject(ProductoService);
  private route           = inject(ActivatedRoute);
  private carritoService  = inject(CarritoService);
  private toastr          = inject(ToastrService);

  producto     = signal<Producto | null>(null);
  relacionados = signal<Producto[]>([]);
  cargando     = signal(true);
  noEncontrado = signal(false);
  cantidad     = signal(1);

  ngOnInit(): void {
    this.route.params.subscribe(p => this.cargar(+p['id']));
  }

  private cargar(id: number): void {
    this.cargando.set(true); this.noEncontrado.set(false); this.cantidad.set(1);
    this.productoService.obtenerPorId(id).subscribe({
      next: p => {
        this.producto.set(p); this.cargando.set(false);
        if (p.tipoVehiculo) {
          this.productoService.obtenerPorTipoVehiculo(p.tipoVehiculo).subscribe({
            next: rel => this.relacionados.set(rel.filter(r => r.id !== id).slice(0, 4))
          });
        }
      },
      error: () => { this.noEncontrado.set(true); this.cargando.set(false); }
    });
  }

  incrementar(): void {
    if (this.cantidad() < (this.producto()?.stock ?? 1)) this.cantidad.update(v => v + 1);
  }
  decrementar(): void { if (this.cantidad() > 1) this.cantidad.update(v => v - 1); }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p) return;
    this.carritoService.agregarProducto(p, this.cantidad());
    this.toastr.success(`${p.nombre} agregado al carrito`, '¡Listo!');
  }
}
