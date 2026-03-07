import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Page } from '../../../../core/services/producto.service';
import { Pedido, EstadoPedido, ESTADO_PEDIDO_LABEL } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class AdminOrderList implements OnInit {
  private svc    = inject(PedidoService);
  private toastr = inject(ToastrService);
  private route  = inject(ActivatedRoute);

  pagina       = signal<Page<Pedido> | null>(null);
  cargando     = signal(true);
  paginaActual = 0;

  // Filtros
  fechaDesde   = '';
  fechaHasta   = '';
  estadoFiltro: EstadoPedido | '' = '';
  soloRecojo   = false;

  readonly ESTADO_LABEL = ESTADO_PEDIDO_LABEL;
  readonly ESTADOS: EstadoPedido[] = ['PENDIENTE','CONFIRMADO','EN_PREPARACION','ENVIADO','ENTREGADO','CANCELADO'];

  ngOnInit(): void {
    // Leer query param ?recojo=1 del dashboard
    this.route.queryParams.subscribe(params => {
      this.soloRecojo = params['recojo'] === '1';
      this.cargar(0);
    });
  }

  cargar(page = 0): void {
    this.cargando.set(true);
    this.paginaActual = page;
    this.svc.obtenerTodosPaginado(
      page, 20,
      this.fechaDesde,
      this.fechaHasta,
      this.estadoFiltro,
      this.soloRecojo
    ).subscribe({
      next: d => { this.pagina.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  aplicarFiltros(): void { this.cargar(0); }

  limpiarFiltros(): void {
    this.fechaDesde   = '';
    this.fechaHasta   = '';
    this.estadoFiltro = '';
    this.soloRecojo   = false;
    this.cargar(0);
  }

  cambiarEstado(pedido: Pedido, e: Event): void {
    const estado = (e.target as HTMLSelectElement).value as EstadoPedido;
    this.svc.cambiarEstado(pedido.id, estado).subscribe({
      next: () => { this.toastr.success('Estado actualizado'); this.cargar(this.paginaActual); }
    });
  }

  pillClass(e: string): string {
    return ({
      PENDIENTE: 'spill--amber', CONFIRMADO: 'spill--blue',
      EN_PREPARACION: 'spill--blue', ENVIADO: 'spill--purple',
      ENTREGADO: 'spill--green', CANCELADO: 'spill--red'
    } as any)[e] ?? 'spill--gray';
  }

  esRecojo(p: Pedido): boolean {
    return p.direccionEnvio === 'RECOJO EN TIENDA';
  }

  get hayFiltrosActivos(): boolean {
    return !!(this.fechaDesde || this.fechaHasta || this.estadoFiltro || this.soloRecojo);
  }

  get paginas() { return Array.from({ length: this.pagina()?.totalPages ?? 0 }, (_, i) => i); }
}