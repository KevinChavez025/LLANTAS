import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductoService, Page } from '../../../../core/services/producto.service';
import { Producto } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  private svc    = inject(ProductoService);
  private toastr = inject(ToastrService);

  pagina       = signal<Page<Producto> | null>(null);
  cargando     = signal(true);
  paginaActual = 0;
  busqueda     = '';
  eliminandoId = signal<number | null>(null);

  ngOnInit() { this.cargar(); }

  cargar(page = 0): void {
    this.cargando.set(true); this.paginaActual = page;
    this.svc.obtenerPaginado(page, 20).subscribe({
      next: d => { this.pagina.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  buscar(): void {
    if (!this.busqueda.trim()) { this.cargar(0); return; }
    this.cargando.set(true);
    this.svc.buscar(this.busqueda).subscribe({
      next: d => {
        this.pagina.set({ content:d, totalElements:d.length, totalPages:1, size:d.length, number:0, first:true, last:true });
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  desactivar(p: Producto): void {
    if (!confirm(`¿Desactivar "${p.nombre}"?`)) return;
    this.eliminandoId.set(p.id);
    this.svc.eliminar(p.id).subscribe({
      next: () => { this.toastr.success('Producto desactivado'); this.eliminandoId.set(null); this.cargar(this.paginaActual); },
      error: () => this.eliminandoId.set(null)
    });
  }

  get paginas() { return Array.from({ length: this.pagina()?.totalPages ?? 0 }, (_, i) => i); }
}
