import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../../../core/services/producto.service';
import { Producto } from '../../../../core/models/producto.model';

interface CategoriaGroup {
  tipo: string;
  productos: Producto[];
  totalStock: number;
  activos: number;
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList implements OnInit {
  private svc = inject(ProductoService);

  productos  = signal<Producto[]>([]);
  cargando   = signal(true);
  expandido  = signal<string | null>(null);

  grupos = computed<CategoriaGroup[]>(() => {
    const mapa = new Map<string, Producto[]>();
    for (const p of this.productos()) {
      const tipo = p.tipoVehiculo ?? 'Sin categoría';
      if (!mapa.has(tipo)) mapa.set(tipo, []);
      mapa.get(tipo)!.push(p);
    }
    return Array.from(mapa.entries()).map(([tipo, prods]) => ({
      tipo,
      productos: prods,
      totalStock: prods.reduce((acc, p) => acc + p.stock, 0),
      activos: prods.filter(p => p.disponible).length
    })).sort((a, b) => a.tipo.localeCompare(b.tipo));
  });

  readonly TIPO_ICON: Record<string, string> = {
    'Auto': '🚗', 'Moto': '🏍️', 'Mototaxi': '🛺',
    'Camión': '🚛', 'Camion': '🚛', 'Minería': '⛏️',
    'Mineria': '⛏️', '4x4': '🚙', 'Bus': '🚌', 'Sin categoría': '📦'
  };

  ngOnInit(): void {
    this.svc.obtenerTodos().subscribe({
      next: d => { this.productos.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  toggle(tipo: string): void {
    this.expandido.set(this.expandido() === tipo ? null : tipo);
  }

  getIcon(tipo: string): string {
    return this.TIPO_ICON[tipo] ?? '🔧';
  }
}