import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Pedido, EstadoPedido, ESTADO_PEDIDO_LABEL, ESTADO_PAGO_LABEL, METODO_PAGO_LABEL } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class AdminOrderDetail implements OnInit {
  private svc    = inject(PedidoService);
  private route  = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  pedido    = signal<Pedido | null>(null);
  /** El backend no expone historial de estados — se mantiene vacío */
  historial = signal<any[]>([]);
  cargando  = signal(true);

  readonly ESTADO_LABEL = ESTADO_PEDIDO_LABEL;
  readonly PAGO_LABEL   = ESTADO_PAGO_LABEL;
  readonly METODO_LABEL = METODO_PAGO_LABEL;
  readonly ESTADOS: EstadoPedido[] = ['PENDIENTE','CONFIRMADO','EN_PREPARACION','ENVIADO','ENTREGADO','CANCELADO'];

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.svc.obtenerPorId(id).subscribe({
      next: d => { this.pedido.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  cambiarEstado(e: Event): void {
    const estado = (e.target as HTMLSelectElement).value as EstadoPedido;
    const id = this.pedido()!.id;
    this.svc.cambiarEstado(id, estado).subscribe({
      next: p => { this.pedido.set(p); this.toastr.success('Estado actualizado'); }
    });
  }
}
