import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Pedido, ESTADO_PEDIDO_LABEL } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private pedidos   = inject(PedidoService);
  private productos = inject(ProductoService);
  private usuarios  = inject(UsuarioService);

  cargando           = signal(true);
  totalPedidos       = signal(0);
  pedidosPendientes  = signal(0);
  pedidosEntregados  = signal(0);
  totalProductos     = signal(0);
  totalUsuarios      = signal(0);
  ingresoTotal       = signal(0);
  recientes          = signal<Pedido[]>([]);
  hoy                = new Date();

  readonly ESTADO_LABEL = ESTADO_PEDIDO_LABEL;
  readonly METODO_LABEL: Record<string, string> = {
    EFECTIVO: 'Efectivo', TARJETA_CREDITO: 'Tarjeta crédito',
    TARJETA_DEBITO: 'Tarjeta débito', TRANSFERENCIA: 'Transferencia',
    YAPE: 'Yape', PLIN: 'Plin'
  };

  ngOnInit(): void {
    forkJoin({
      pedidos:   this.pedidos.obtenerTodosPaginado(0, 100),
      productos: this.productos.obtenerPaginado(0, 1),
      usuarios:  this.usuarios.obtenerTodos()
    }).subscribe({
      next: ({ pedidos, productos, usuarios }) => {
        this.totalPedidos.set(pedidos.totalElements);
        this.pedidosPendientes.set(pedidos.content.filter(p => p.estado === 'PENDIENTE').length);
        this.pedidosEntregados.set(pedidos.content.filter(p => p.estado === 'ENTREGADO').length);
        this.totalProductos.set(productos.totalElements);
        this.totalUsuarios.set(usuarios.length);
        this.ingresoTotal.set(pedidos.content.reduce((acc, p) => acc + (p.total ?? 0), 0));
        this.recientes.set(pedidos.content.slice(0, 6));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  estadoClass(e: string): string {
    return ({
      PENDIENTE:      'pill--amber',
      CONFIRMADO:     'pill--blue',
      EN_PREPARACION: 'pill--blue',
      ENVIADO:        'pill--purple',
      ENTREGADO:      'pill--green',
      CANCELADO:      'pill--red'
    } as any)[e] ?? 'pill--gray';
  }

  pagoIconClass(metodo?: string): string {
    return ({
      YAPE: 'pago--purple', PLIN: 'pago--blue',
      TRANSFERENCIA: 'pago--teal', EFECTIVO: 'pago--green',
      TARJETA_CREDITO: 'pago--amber', TARJETA_DEBITO: 'pago--amber'
    } as any)[metodo ?? ''] ?? 'pago--gray';
  }
}