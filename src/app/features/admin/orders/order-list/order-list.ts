import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  pagina       = signal<Page<Pedido> | null>(null);
  cargando     = signal(true);
  paginaActual = 0;

  readonly ESTADO_LABEL = ESTADO_PEDIDO_LABEL;
  readonly ESTADOS: EstadoPedido[] = ['PENDIENTE','CONFIRMADO','EN_PREPARACION','ENVIADO','ENTREGADO','CANCELADO'];

  ngOnInit() { this.cargar(); }

  cargar(page = 0): void {
    this.cargando.set(true); this.paginaActual = page;
    this.svc.obtenerTodosPaginado(page, 20).subscribe({
      next: d => { this.pagina.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  cambiarEstado(pedido: Pedido, e: Event): void {
    const estado = (e.target as HTMLSelectElement).value as EstadoPedido;
    this.svc.cambiarEstado(pedido.id, estado).subscribe({
      next: () => { this.toastr.success('Estado actualizado'); this.cargar(this.paginaActual); }
    });
  }

  badge(e: string): string {
    return ({PENDIENTE:'bg-warning text-dark',CONFIRMADO:'bg-info',EN_PREPARACION:'bg-info',
              ENVIADO:'bg-primary',ENTREGADO:'bg-success',CANCELADO:'bg-danger'} as any)[e] ?? 'bg-secondary';
  }

  get paginas() { return Array.from({ length: this.pagina()?.totalPages ?? 0 }, (_, i) => i); }
}
