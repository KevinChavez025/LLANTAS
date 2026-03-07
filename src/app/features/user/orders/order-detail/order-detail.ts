import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Pedido } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail implements OnInit {
  private pedidoService = inject(PedidoService);
  private route         = inject(ActivatedRoute);

  pedido   = signal<Pedido | null>(null);
  cargando = signal(true);
  error    = signal(false);

  esRecojo = computed(() =>
    this.pedido()?.direccionEnvio === 'RECOJO EN TIENDA'
  );

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.pedidoService.obtenerPorId(id).subscribe({
      next:  d  => { this.pedido.set(d); this.cargando.set(false); },
      error: () => { this.error.set(true); this.cargando.set(false); }
    });
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado',
      EN_PREPARACION: 'En preparación', ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
    };
    return map[estado] ?? estado;
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'badge--warning', CONFIRMADO: 'badge--info',
      EN_PREPARACION: 'badge--info', ENVIADO: 'badge--primary',
      ENTREGADO: 'badge--success', CANCELADO: 'badge--danger',
    };
    return map[estado] ?? 'badge--secondary';
  }

  metodoLabel(metodo: string | undefined): string {
    if (!metodo) return '';
    const map: Record<string, string> = {
      YAPE: 'Yape', PLIN: 'Plin',
      TRANSFERENCIA: 'Transferencia',
      TARJETA_CREDITO: 'Tarjeta de crédito', TARJETA_DEBITO: 'Tarjeta de débito',
    };
    return map[metodo] ?? metodo;
  }

  // Flujo envío: PENDIENTE → CONFIRMADO → EN_PREPARACION → ENVIADO → ENTREGADO
  // Flujo recojo: PENDIENTE → CONFIRMADO → EN_PREPARACION → ENTREGADO
  isStepDone(estadoActual: string, step: string): boolean {
    const orderEnvio  = ['PENDIENTE','CONFIRMADO','EN_PREPARACION','ENVIADO','ENTREGADO'];
    const orderRecojo = ['PENDIENTE','CONFIRMADO','EN_PREPARACION','ENTREGADO'];
    const order = this.esRecojo() ? orderRecojo : orderEnvio;
    return order.indexOf(estadoActual) > order.indexOf(step);
  }

  // Para recojo EN_PREPARACION = "Listo para recoger"
  stepLabel(step: string): string {
    if (this.esRecojo()) {
      const map: Record<string, string> = {
        PENDIENTE: 'Pendiente',
        CONFIRMADO: 'Confirmado',
        EN_PREPARACION: 'Listo para recoger',
        ENTREGADO: 'Entregado',
      };
      return map[step] ?? step;
    }
    return this.estadoLabel(step);
  }

  igv(): number {
    return Math.round((this.pedido()?.total ?? 0) / 1.18 * 0.18 * 100) / 100;
  }

  subtotal(): number {
    return Math.round((this.pedido()?.total ?? 0) / 1.18 * 100) / 100;
  }
}