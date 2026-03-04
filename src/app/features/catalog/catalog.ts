import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {
  private productoService = inject(ProductoService);
  private route           = inject(ActivatedRoute);

  todos    = signal<Producto[]>([]);
  cargando = signal(true);
  orden    = signal('nombre');
  busqueda = signal('');

  // ── Filtros activos ───────────────────────────────────────
  filtroMarcas       = signal<Set<string>>(new Set());
  filtroModelos      = signal<Set<string>>(new Set());
  filtroTipos        = signal<Set<string>>(new Set());
  filtroAnchos       = signal<Set<string>>(new Set());
  filtroPerfiles     = signal<Set<string>>(new Set());
  filtroAros         = signal<Set<string>>(new Set());
  filtroArosPermit   = signal<Set<string>>(new Set());
  filtroPresentacion = signal<Set<string>>(new Set());
  filtroVelocidad    = signal<Set<string>>(new Set());
  filtroEstrellas    = signal<Set<string>>(new Set());
  filtroServicio     = signal<Set<string>>(new Set());
  filtroRunFlat      = signal<Set<string>>(new Set());
  filtroPrecioMax    = signal(0);

  // ── Opciones dinámicas extraídas de los productos ─────────
  opcMarcas       = computed(() => uniq(this.todos().map(p => p.marca)));
  opcModelos      = computed(() => uniq(this.todos().map(p => p.modelo)));
  opcTipos        = computed(() => uniq(this.todos().map(p => p.tipoVehiculo)));
  opcAnchos       = computed(() => uniq(this.todos().map(p => p.ancho)));
  opcPerfiles     = computed(() => uniq(this.todos().map(p => p.perfil)));
  opcAros         = computed(() => uniq(this.todos().map(p => p.aro)));
  opcArosPermit   = computed(() => uniq(this.todos().map(p => p.aroPermitido)));
  opcPresentacion = computed(() => uniq(this.todos().map(p => p.presentacion)));
  opcVelocidad    = computed(() => uniq(this.todos().map(p => p.rangoVelocidad)));
  opcEstrellas    = computed(() => uniq(this.todos().map(p => p.estrellas?.toString())));
  opcServicio     = computed(() => uniq(this.todos().map(p => p.servicio)));
  opcRunFlat      = computed(() => uniq(this.todos().map(p => p.runFlat?.toString())));
  precioMaximo    = computed(() => Math.max(...this.todos().map(p => p.precio ?? 0), 0));

  // ── Lista de filtros activos para mostrar los chips ───────
  filtrosActivos = computed(() => {
    const chips: { label: string; signal: any; valor: string }[] = [];
    const add = (sig: ReturnType<typeof signal<Set<string>>>) =>
      [...sig()].forEach(v => chips.push({ label: v, signal: sig, valor: v }));
    add(this.filtroMarcas);
    add(this.filtroModelos);
    add(this.filtroTipos);
    add(this.filtroAnchos);
    add(this.filtroPerfiles);
    add(this.filtroAros);
    add(this.filtroArosPermit);
    add(this.filtroPresentacion);
    add(this.filtroVelocidad);
    add(this.filtroEstrellas);
    add(this.filtroServicio);
    add(this.filtroRunFlat);
    return chips;
  });

  // ── Productos filtrados ───────────────────────────────────
  productos = computed(() => {
    let lista = this.todos();

    const q = this.busqueda().toLowerCase();
    if (q) lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.medida?.toLowerCase().includes(q)
    );

    if (this.filtroMarcas().size)       lista = lista.filter(p => this.filtroMarcas().has(p.marca));
    if (this.filtroModelos().size)      lista = lista.filter(p => p.modelo && this.filtroModelos().has(p.modelo));
    if (this.filtroTipos().size)        lista = lista.filter(p => p.tipoVehiculo && this.filtroTipos().has(p.tipoVehiculo));
    if (this.filtroAnchos().size)       lista = lista.filter(p => p.ancho && this.filtroAnchos().has(p.ancho));
    if (this.filtroPerfiles().size)     lista = lista.filter(p => p.perfil && this.filtroPerfiles().has(p.perfil));
    if (this.filtroAros().size)         lista = lista.filter(p => p.aro && this.filtroAros().has(p.aro));
    if (this.filtroArosPermit().size)   lista = lista.filter(p => p.aroPermitido && this.filtroArosPermit().has(p.aroPermitido));
    if (this.filtroPresentacion().size) lista = lista.filter(p => p.presentacion && this.filtroPresentacion().has(p.presentacion));
    if (this.filtroVelocidad().size)    lista = lista.filter(p => p.rangoVelocidad && this.filtroVelocidad().has(p.rangoVelocidad));
    if (this.filtroEstrellas().size)    lista = lista.filter(p => p.estrellas != null && this.filtroEstrellas().has(p.estrellas.toString()));
    if (this.filtroServicio().size)     lista = lista.filter(p => p.servicio && this.filtroServicio().has(p.servicio));
    if (this.filtroRunFlat().size)      lista = lista.filter(p => p.runFlat != null && this.filtroRunFlat().has(p.runFlat.toString()));
    if (this.filtroPrecioMax() > 0)     lista = lista.filter(p => (p.precio ?? 0) <= this.filtroPrecioMax());

    switch (this.orden()) {
      case 'precio-asc':  return [...lista].sort((a, b) => a.precio - b.precio);
      case 'precio-desc': return [...lista].sort((a, b) => b.precio - a.precio);
      case 'nuevo':       return [...lista].sort((a, b) => (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0));
      default:            return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  });

  hayFiltrosActivos = computed(() =>
    this.filtrosActivos().length > 0 ||
    this.busqueda() !== '' ||
    (this.filtroPrecioMax() > 0 && this.filtroPrecioMax() < this.precioMaximo())
  );

  ngOnInit(): void {
    // Recibe parámetros del buscador del Home
    this.route.queryParams.subscribe(p => {
      if (p['tipo'])   this.filtroTipos.set(new Set([p['tipo']]));
      if (p['ancho'])  this.filtroAnchos.set(new Set([p['ancho']]));
      if (p['perfil']) this.filtroPerfiles.set(new Set([p['perfil']]));
      if (p['aro'])    this.filtroAros.set(new Set([p['aro']]));
    });
    this.cargarTodos();
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.productoService.obtenerTodos().subscribe({
      next: d => {
        this.todos.set(d);
        this.filtroPrecioMax.set(this.precioMaximo());
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  // ── Toggle de checkbox ────────────────────────────────────
  toggle(sig: ReturnType<typeof signal<Set<string>>>, valor: string): void {
    const s = new Set(sig());
    s.has(valor) ? s.delete(valor) : s.add(valor);
    sig.set(s);
  }

  isChecked(sig: ReturnType<typeof signal<Set<string>>>, valor: string): boolean {
    return sig().has(valor);
  }

  // ── Quitar un chip individual ─────────────────────────────
  quitarFiltro(chip: { signal: any; valor: string }): void {
    const s = new Set(chip.signal());
    s.delete(chip.valor);
    chip.signal.set(s);
  }

  // ── Limpiar todos ─────────────────────────────────────────
  limpiarFiltros(): void {
    [
      this.filtroMarcas, this.filtroModelos, this.filtroTipos,
      this.filtroAnchos, this.filtroPerfiles, this.filtroAros,
      this.filtroArosPermit, this.filtroPresentacion, this.filtroVelocidad,
      this.filtroEstrellas, this.filtroServicio, this.filtroRunFlat
    ].forEach(s => s.set(new Set()));
    this.busqueda.set('');
    this.filtroPrecioMax.set(this.precioMaximo());
    this.cargarTodos();
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

  onPrecioMax(e: Event): void {
    this.filtroPrecioMax.set(+(e.target as HTMLInputElement).value);
  }
}

// ── Helper ────────────────────────────────────────────────
function uniq(arr: (string | undefined | null)[]): string[] {
  return [...new Set(arr.filter((v): v is string => !!v))].sort();
}