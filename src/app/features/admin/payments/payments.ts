import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { Page } from '../../../core/services/producto.service';
import { Pedido, EstadoPago, MetodoPago, ESTADO_PAGO_LABEL, METODO_PAGO_LABEL } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss'
})
export class AdminPayments implements OnInit {
  private svc = inject(PedidoService);

  pagina       = signal<Page<Pedido> | null>(null);
  cargando     = signal(true);
  paginaActual = 0;

  // Filtros
  fechaDesde   = '';
  fechaHasta   = '';
  metodoPago: MetodoPago | '' = '';
  estadoPago: EstadoPago | '' = '';

  readonly ESTADO_PAGO_LABEL  = ESTADO_PAGO_LABEL;
  readonly METODO_PAGO_LABEL  = METODO_PAGO_LABEL;
  readonly METODOS: MetodoPago[]    = ['YAPE','PLIN','EFECTIVO' as any,'TRANSFERENCIA','TARJETA_CREDITO','TARJETA_DEBITO'];
  readonly ESTADOS_PAGO: EstadoPago[] = ['PENDIENTE','PAGADO','FALLIDO','REEMBOLSADO'];

  // Totales calculados de la página actual
  totalPagado = computed(() =>
    (this.pagina()?.content ?? [])
      .filter(p => p.estadoPago === 'PAGADO')
      .reduce((acc, p) => acc + p.total, 0)
  );
  totalPendiente = computed(() =>
    (this.pagina()?.content ?? [])
      .filter(p => p.estadoPago === 'PENDIENTE')
      .reduce((acc, p) => acc + p.total, 0)
  );
  cantidadPagados = computed(() =>
    (this.pagina()?.content ?? []).filter(p => p.estadoPago === 'PAGADO').length
  );

  ngOnInit() { this.cargar(); }

  cargar(page = 0): void {
    this.cargando.set(true);
    this.paginaActual = page;
    this.svc.obtenerTodosPaginado(page, 20, this.fechaDesde, this.fechaHasta).subscribe({
      next: d => { this.pagina.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  aplicarFiltros(): void { this.cargar(0); }

  limpiarFiltros(): void {
    this.fechaDesde  = '';
    this.fechaHasta  = '';
    this.metodoPago  = '';
    this.estadoPago  = '';
    this.cargar(0);
  }

  get pedidosFiltrados(): Pedido[] {
    return (this.pagina()?.content ?? []).filter(p => {
      if (this.metodoPago && p.metodoPago !== this.metodoPago) return false;
      if (this.estadoPago && p.estadoPago !== this.estadoPago) return false;
      return true;
    });
  }

  pillPago(e: string): string {
    return ({
      PAGADO: 'pill--green', PENDIENTE: 'pill--amber',
      FALLIDO: 'pill--red',  REEMBOLSADO: 'pill--purple'
    } as any)[e] ?? 'pill--gray';
  }

  pillMetodo(e: string): string {
    return ({
      YAPE: 'pill--purple', PLIN: 'pill--blue',
      TRANSFERENCIA: 'pill--blue', EFECTIVO: 'pill--green',
      TARJETA_CREDITO: 'pill--gray', TARJETA_DEBITO: 'pill--gray'
    } as any)[e] ?? 'pill--gray';
  }

  get hayFiltrosActivos(): boolean {
    return !!(this.fechaDesde || this.fechaHasta || this.metodoPago || this.estadoPago);
  }

  get paginas() { return Array.from({ length: this.pagina()?.totalPages ?? 0 }, (_, i) => i); }
}