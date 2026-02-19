import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {

  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);

  // ── Estado ──────────────────────────────
  todos         = signal<Producto[]>([]);
  cargando      = signal(true);

  // Filtros activos
  filtroTipo    = signal('');
  filtroCategoria = signal('');
  filtroPrecioMax = signal(0);
  busqueda      = signal('');
  orden         = signal('nombre');

  // Opciones derivadas de los datos
  tiposVehiculo = computed(() =>
    [...new Set(this.todos().map(p => p.tipoVehiculo).filter(Boolean))] as string[]
  );
  categorias = computed(() =>
    [...new Set(this.todos().map(p => p.categoria).filter(Boolean))] as string[]
  );
  precioMaximo = computed(() =>
    Math.max(...this.todos().map(p => p.precio ?? 0), 0)
  );

  // Lista filtrada y ordenada
  productos = computed(() => {
    let lista = this.todos();

    if (this.busqueda()) {
      const q = this.busqueda().toLowerCase();
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.medida?.toLowerCase().includes(q)
      );
    }
    if (this.filtroTipo()) {
      lista = lista.filter(p => p.tipoVehiculo === this.filtroTipo());
    }
    if (this.filtroCategoria()) {
      lista = lista.filter(p => p.categoria === this.filtroCategoria());
    }
    if (this.filtroPrecioMax() > 0) {
      lista = lista.filter(p => (p.precio ?? 0) <= this.filtroPrecioMax());
    }

    switch (this.orden()) {
      case 'precio-asc':  return [...lista].sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
      case 'precio-desc': return [...lista].sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
      case 'nuevo':       return [...lista].sort((a, b) => (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0));
      default:            return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  });

  ngOnInit(): void {
    // Leer parámetro ?tipo= desde la URL (viene del home)
    this.route.queryParams.subscribe(params => {
      if (params['tipo']) this.filtroTipo.set(params['tipo']);
    });

    this.http.get<Producto[]>('assets/data/mock-products.json').subscribe({
      next: data => {
        this.todos.set(data);
        this.filtroPrecioMax.set(this.precioMaximo());
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  limpiarFiltros(): void {
    this.filtroTipo.set('');
    this.filtroCategoria.set('');
    this.filtroPrecioMax.set(this.precioMaximo());
    this.busqueda.set('');
    this.orden.set('nombre');
  }

  hayFiltrosActivos(): boolean {
    return !!(
      this.filtroTipo() ||
      this.filtroCategoria() ||
      this.busqueda() ||
      (this.filtroPrecioMax() > 0 && this.filtroPrecioMax() < this.precioMaximo())
    );
  }

  onBusqueda(e: Event): void {
    this.busqueda.set((e.target as HTMLInputElement).value);
  }

  onPrecioMax(e: Event): void {
    this.filtroPrecioMax.set(+(e.target as HTMLInputElement).value);
  }
}