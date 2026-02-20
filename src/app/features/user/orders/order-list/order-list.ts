import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../../../core/services/pedido.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Pedido } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss'
})
export class OrderList implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos  = signal<Pedido[]>([]);
  cargando = signal(true);
  error    = signal(false);

  ngOnInit(): void {
    const user = inject(AuthService).getCurrentUser();
    if (user) {
      this.pedidoService.obtenerMisPedidos(user.id).subscribe({
        next:  d  => { this.pedidos.set(d); this.cargando.set(false); },
        error: () => { this.error.set(true); this.cargando.set(false); }
      });
    }
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado',
      EN_PREPARACION: 'En preparación', ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
    };
    return map[estado] ?? estado;
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'badge--warning', CONFIRMADO: 'badge--info',
      EN_PREPARACION: 'badge--info', ENVIADO: 'badge--primary',
      ENTREGADO: 'badge--success', CANCELADO: 'badge--danger',
    };
    return map[estado] ?? 'badge--secondary';
  }

  getItems(pedido: Pedido) {
    return pedido.detalles || pedido.items || [];
  }
}