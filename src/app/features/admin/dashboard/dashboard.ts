import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Pedido, ESTADO_PEDIDO_LABEL } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private pedidos   = inject(PedidoService);
  private productos = inject(ProductoService);

  cargando          = signal(true);
  totalPedidos      = signal(0);
  pedidosPendientes = signal(0);
  totalProductos    = signal(0);
  recientes         = signal<Pedido[]>([]);

  readonly ESTADO_LABEL = ESTADO_PEDIDO_LABEL;

  ngOnInit(): void {
    forkJoin({
      pedidos:   this.pedidos.obtenerTodosPaginado(0, 50),
      productos: this.productos.obtenerPaginado(0, 1)
    }).subscribe({
      next: ({ pedidos, productos }) => {
        this.totalPedidos.set(pedidos.totalElements);
        this.pedidosPendientes.set(pedidos.content.filter(p => p.estado === 'PENDIENTE').length);
        this.totalProductos.set(productos.totalElements);
        this.recientes.set(pedidos.content.slice(0, 5));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  estadoBadge(e: string): string {
    return ({PENDIENTE:'bg-warning text-dark',CONFIRMADO:'bg-info',EN_PREPARACION:'bg-info',
              ENVIADO:'bg-primary',ENTREGADO:'bg-success',CANCELADO:'bg-danger'} as any)[e] ?? 'bg-secondary';
  }
}
