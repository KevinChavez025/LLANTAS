import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Producto } from '../../core/models/producto.model';
import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit {

  private http           = inject(HttpClient);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private carritoService = inject(CarritoService);
  private toastr         = inject(ToastrService);

  producto     = signal<Producto | null>(null);
  relacionados = signal<Producto[]>([]);
  cargando     = signal(true);
  noEncontrado = signal(false);
  cantidad     = signal(1);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cargarProducto(+params['id']);
    });
  }

  private cargarProducto(id: number): void {
    this.cargando.set(true);
    this.noEncontrado.set(false);
    this.cantidad.set(1);

    this.http.get<Producto[]>('assets/data/mock-products.json').subscribe({
      next: productos => {
        const producto = productos.find(p => p.id === id);
        if (!producto) { this.noEncontrado.set(true); this.cargando.set(false); return; }
        this.producto.set(producto);
        this.relacionados.set(
          productos.filter(p => p.tipoVehiculo === producto.tipoVehiculo && p.id !== id).slice(0, 4)
        );
        this.cargando.set(false);
      },
      error: () => { this.noEncontrado.set(true); this.cargando.set(false); }
    });
  }

  incrementar(): void {
    const max = this.producto()?.stock ?? 1;
    if (this.cantidad() < max) this.cantidad.update(v => v + 1);
  }

  decrementar(): void {
    if (this.cantidad() > 1) this.cantidad.update(v => v - 1);
  }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p) return;
    this.carritoService.agregarProducto(p, this.cantidad());
    this.toastr.success(`${p.nombre} agregado al carrito`, '¡Listo!');
  }
}