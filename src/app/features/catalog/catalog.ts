import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {
  private productoService = inject(ProductoService);
  private route           = inject(ActivatedRoute);

  todos           = signal<Producto[]>([]);
  cargando        = signal(true);
  filtroTipo      = signal('');
  filtroCategoria = signal('');
  filtroPrecioMax = signal(0);
  busqueda        = signal('');
  orden           = signal('nombre');

  tiposVehiculo = computed(() =>
    [...new Set(this.todos().map(p => p.tipoVehiculo).filter(Boolean))] as string[]);
  categorias = computed(() =>
    [...new Set(this.todos().map(p => p.categoria).filter(Boolean))] as string[]);
  precioMaximo = computed(() =>
    Math.max(...this.todos().map(p => p.precio ?? 0), 0));

  productos = computed(() => {
    let lista = this.todos();
    const q = this.busqueda().toLowerCase();
    if (q) lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.medida?.toLowerCase().includes(q)
    );
    if (this.filtroTipo())      lista = lista.filter(p => p.tipoVehiculo === this.filtroTipo());
    if (this.filtroCategoria()) lista = lista.filter(p => p.categoria === this.filtroCategoria());
    if (this.filtroPrecioMax() > 0)
      lista = lista.filter(p => (p.precio ?? 0) <= this.filtroPrecioMax());
    switch (this.orden()) {
      case 'precio-asc':  return [...lista].sort((a, b) => a.precio - b.precio);
      case 'precio-desc': return [...lista].sort((a, b) => b.precio - a.precio);
      case 'nuevo':       return [...lista].sort((a, b) => (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0));
      default:            return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => { if (p['tipo']) this.filtroTipo.set(p['tipo']); });
    this.cargarTodos();
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.productoService.obtenerTodos().subscribe({
      next: d => { this.todos.set(d); this.filtroPrecioMax.set(this.precioMaximo()); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  onBusqueda(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.busqueda.set(val);
    if (val.length >= 3) {
      this.productoService.buscar(val).subscribe({ next: d => this.todos.set(d) });
    } else if (val.length === 0) {
      this.cargarTodos();
    }
  }

  onPrecioMax(e: Event): void { this.filtroPrecioMax.set(+(e.target as HTMLInputElement).value); }

  limpiarFiltros(): void {
    this.filtroTipo.set(''); this.filtroCategoria.set('');
    this.filtroPrecioMax.set(this.precioMaximo()); this.busqueda.set('');
    this.orden.set('nombre'); this.cargarTodos();
  }

  hayFiltrosActivos(): boolean {
    return !!(this.filtroTipo() || this.filtroCategoria() || this.busqueda() ||
      (this.filtroPrecioMax() > 0 && this.filtroPrecioMax() < this.precioMaximo()));
  }
}