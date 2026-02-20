import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../../../core/services/pedido.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Pedido, ESTADO_PEDIDO_LABEL, ESTADO_PAGO_LABEL } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class OrderList implements OnInit {
  private pedidoService = inject(PedidoService);
  private auth          = inject(AuthService);

  pedidos  = signal<Pedido[]>([]);
  cargando = signal(true);
  error    = signal(false);

  readonly ESTADO_LABEL    = ESTADO_PEDIDO_LABEL;
  readonly PAGO_LABEL      = ESTADO_PAGO_LABEL;

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.pedidoService.obtenerMisPedidos(user.id).subscribe({
      next: d => { this.pedidos.set(d); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); }
    });
  }

  estadoBadge(estado: string): string {
    return ({ PENDIENTE:'bg-warning text-dark', CONFIRMADO:'bg-info', EN_PREPARACION:'bg-info',
               ENVIADO:'bg-primary', ENTREGADO:'bg-success', CANCELADO:'bg-danger' } as any)[estado] ?? 'bg-secondary';
  }
}
